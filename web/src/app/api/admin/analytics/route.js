import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // User Growth Analytics
    const userGrowth = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN role = 'supplier' THEN 1 END) as new_suppliers
      FROM users 
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Revenue Analytics (using payments table instead of transactions)
    const revenueData = await sql`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payments 
      WHERE status = 'succeeded' 
        AND created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Ad Performance Analytics (using correct table names)
    const adPerformance = await sql`
      SELECT 
        ac.name as category,
        COUNT(ma.id) as total_ads,
        COUNT(CASE WHEN ma.status = 'approved' THEN 1 END) as approved_ads,
        COUNT(CASE WHEN ma.status = 'rejected' THEN 1 END) as rejected_ads,
        ROUND(
          COUNT(CASE WHEN ma.status = 'approved' THEN 1 END)::DECIMAL / 
          NULLIF(COUNT(ma.id), 0) * 100, 
          2
        ) as approval_rate
      FROM ad_categories ac
      LEFT JOIN marketplace_ads ma ON ac.id = ma.category_id
        AND ma.created_at >= ${startDate.toISOString()}
      GROUP BY ac.id, ac.name
      ORDER BY total_ads DESC
    `;

    // Top Performing Suppliers (using correct table names)
    const topSuppliers = await sql`
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        sub.status as subscription_status,
        COUNT(ma.id) as total_ads,
        COUNT(CASE WHEN ma.status = 'approved' THEN 1 END) as approved_ads,
        SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END) as revenue_generated
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN marketplace_ads ma ON s.id = ma.supplier_id
      LEFT JOIN payments p ON s.user_id = p.user_id
        AND p.created_at >= ${startDate.toISOString()}
      LEFT JOIN subscriptions sub ON s.id = sub.supplier_id
      WHERE s.created_at >= ${startDate.toISOString()} OR ma.created_at >= ${startDate.toISOString()}
      GROUP BY s.id, u.first_name, u.last_name, u.email, sub.status
      ORDER BY approved_ads DESC, revenue_generated DESC
      LIMIT 10
    `;

    // Platform Health Metrics (using correct table names)
    const [platformMetrics] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at >= ${startDate.toISOString()}) as new_users_period,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_suppliers,
        (SELECT COUNT(*) FROM marketplace_ads WHERE status = 'pending') as pending_reviews,
        (SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) 
         FROM marketplace_ads WHERE status = 'approved' 
         AND created_at >= ${startDate.toISOString()}) as avg_review_time_hours,
        (SELECT COUNT(*) FROM concierge_requests WHERE status = 'new') as pending_requests
    `;

    // Content Performance (using correct table names)
    const contentMetrics = await sql`
      SELECT 
        'articles' as content_type,
        COUNT(*) as total_items,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_items,
        COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) as published_items
      FROM articles
      WHERE created_at >= ${startDate.toISOString()}
      
      UNION ALL
      
      SELECT 
        'awards' as content_type,
        COUNT(*) as total_items,
        0 as featured_items,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_items
      FROM awards
      WHERE created_at >= ${startDate.toISOString()}
    `;

    // Monthly Revenue Trend (using payments table)
    const monthlyRevenue = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions,
        COUNT(DISTINCT user_id) as active_suppliers
      FROM payments 
      WHERE status = 'succeeded' 
        AND created_at >= ${new Date(startDate.getFullYear(), startDate.getMonth() - 11, 1).toISOString()}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `;

    // Geographic Distribution (using correct table name)
    const geographicData = await sql`
      SELECT 
        COALESCE(ma.location, 'Unknown') as location,
        COUNT(*) as ad_count,
        COUNT(CASE WHEN ma.status = 'approved' THEN 1 END) as approved_count
      FROM marketplace_ads ma
      WHERE ma.created_at >= ${startDate.toISOString()}
        AND ma.location IS NOT NULL
        AND ma.location != ''
      GROUP BY ma.location
      ORDER BY ad_count DESC
      LIMIT 10
    `;

    return Response.json({
      period: parseInt(period),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      platformMetrics,
      userGrowth,
      revenueData,
      monthlyRevenue,
      adPerformance,
      topSuppliers,
      contentMetrics,
      geographicData,
      summary: {
        totalUsers: parseInt(platformMetrics.total_users),
        newUsers: parseInt(platformMetrics.new_users_period),
        activeSuppliers: parseInt(platformMetrics.active_suppliers),
        pendingReviews: parseInt(platformMetrics.pending_reviews),
        avgReviewTime: parseFloat(platformMetrics.avg_review_time_hours) || 0,
        pendingRequests: parseInt(platformMetrics.pending_requests),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

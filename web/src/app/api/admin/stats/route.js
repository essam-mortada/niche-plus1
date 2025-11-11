import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Get overview statistics for admin dashboard
    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM suppliers WHERE kyc_status = 'verified') as active_suppliers,
        (SELECT COUNT(*) FROM suppliers) as total_suppliers,
        (SELECT COUNT(*) FROM marketplace_ads WHERE status = 'pending') as pending_ads,
        (SELECT COUNT(*) FROM marketplace_ads WHERE status = 'approved') as approved_ads,
        (SELECT COUNT(*) FROM marketplace_ads WHERE status = 'rejected') as rejected_ads,
        (SELECT COUNT(*) FROM marketplace_ads) as total_ads,
        (SELECT COUNT(*) FROM concierge_requests WHERE status = 'new') as pending_requests,
        (SELECT COUNT(*) FROM concierge_requests) as total_requests,
        (SELECT SUM(amount) FROM payments WHERE status = 'succeeded') as total_revenue,
        (SELECT COUNT(*) FROM payments WHERE status = 'succeeded') as successful_transactions
    `;

    // Get recent activity
    const recentAds = await sql`
      SELECT 
        a.id,
        a.title,
        a.status,
        a.created_at,
        u.first_name,
        u.last_name,
        c.name as category_name
      FROM marketplace_ads a
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN ad_categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `;

    const recentRequests = await sql`
      SELECT 
        r.id,
        r.name,
        r.message,
        r.status,
        r.created_at,
        u.first_name,
        u.last_name
      FROM concierge_requests r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    return Response.json({
      stats,
      recentAds,
      recentRequests,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return Response.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}

import sql from "@/app/api/utils/sql";
import { getUserFromToken, requireRole } from "@/app/api/utils/auth";

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);
    requireRole(user, "admin");

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [dashboardStats] = await sql.transaction([
      // Total counts and KPIs
      sql`
        SELECT 
          -- User stats
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.role = 'supplier' THEN u.id END) as total_suppliers,
          COUNT(DISTINCT CASE WHEN u.role = 'admin' THEN u.id END) as total_admins,
          COUNT(DISTINCT CASE WHEN u.created_at >= ${startDate} THEN u.id END) as new_users_period,
          
          -- Marketplace stats
          COUNT(DISTINCT ma.id) as total_ads,
          COUNT(DISTINCT CASE WHEN ma.status = 'approved' THEN ma.id END) as live_ads,
          COUNT(DISTINCT CASE WHEN ma.status = 'pending' THEN ma.id END) as pending_ads,
          COUNT(DISTINCT CASE WHEN ma.status = 'rejected' THEN ma.id END) as rejected_ads,
          COUNT(DISTINCT CASE WHEN ma.created_at >= ${startDate} THEN ma.id END) as new_ads_period,
          
          -- Award stats
          COUNT(DISTINCT aw.id) as total_awards,
          COUNT(DISTINCT CASE WHEN aw.status = 'published' THEN aw.id END) as published_awards,
          COUNT(DISTINCT n.id) as total_nominations,
          COUNT(DISTINCT t.id) as total_tickets,
          
          -- Magazine stats
          COUNT(DISTINCT mi.id) as total_issues,
          COUNT(DISTINCT CASE WHEN mi.status = 'published' THEN mi.id END) as published_issues,
          COUNT(DISTINCT ar.id) as total_articles,
          COUNT(DISTINCT CASE WHEN ar.status = 'published' THEN ar.id END) as published_articles,
          
          -- Concierge requests
          COUNT(DISTINCT cr.id) as total_requests,
          COUNT(DISTINCT CASE WHEN cr.status = 'new' THEN cr.id END) as new_requests,
          COUNT(DISTINCT CASE WHEN cr.status = 'in_progress' THEN cr.id END) as in_progress_requests,
          
          -- Subscription stats
          COUNT(DISTINCT s.id) as total_subscriptions,
          COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_subscriptions,
          COUNT(DISTINCT CASE WHEN s.status = 'past_due' THEN s.id END) as past_due_subscriptions
          
        FROM users u
        LEFT JOIN suppliers sup ON u.id = sup.user_id
        LEFT JOIN subscriptions s ON sup.id = s.supplier_id
        LEFT JOIN marketplace_ads ma ON sup.id = ma.supplier_id
        LEFT JOIN awards aw ON 1=1
        LEFT JOIN nominations n ON aw.id = n.award_id
        LEFT JOIN tickets t ON aw.id = t.award_id
        LEFT JOIN magazine_issues mi ON 1=1
        LEFT JOIN articles ar ON mi.id = ar.issue_id OR ar.issue_id IS NULL
        LEFT JOIN concierge_requests cr ON 1=1
      `,

      // Revenue stats from payments
      sql`
        SELECT 
          COUNT(CASE WHEN p.status = 'succeeded' THEN 1 END) as successful_payments,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount END), 0) as total_revenue_cents,
          COALESCE(SUM(CASE WHEN p.status = 'succeeded' AND p.created_at >= ${startDate} THEN p.amount END), 0) as period_revenue_cents,
          COALESCE(SUM(CASE WHEN p.type = 'subscription' AND p.status = 'succeeded' THEN p.amount END), 0) as subscription_revenue_cents,
          COALESCE(SUM(CASE WHEN p.type = 'nomination' AND p.status = 'succeeded' THEN p.amount END), 0) as nomination_revenue_cents,
          COALESCE(SUM(CASE WHEN p.type = 'ticket' AND p.status = 'succeeded' THEN p.amount END), 0) as ticket_revenue_cents
        FROM payments p
      `,

      // Top performing ads
      sql`
        SELECT ma.id, ma.title, ma.views, ma.clicks, 
               s.company_name, u.first_name, u.last_name
        FROM marketplace_ads ma
        JOIN suppliers s ON ma.supplier_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ma.status = 'approved'
        ORDER BY (ma.views + ma.clicks) DESC
        LIMIT 5
      `,

      // Recent activity for admin attention
      sql`
        SELECT 
          'ad_pending' as type,
          ma.id,
          ma.title as title,
          ma.created_at as created_at,
          u.first_name || ' ' || u.last_name as user_name
        FROM marketplace_ads ma
        JOIN suppliers s ON ma.supplier_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE ma.status = 'pending'
        
        UNION ALL
        
        SELECT 
          'request_new' as type,
          cr.id,
          'New concierge request from ' || cr.name as title,
          cr.created_at,
          cr.name as user_name
        FROM concierge_requests cr
        WHERE cr.status = 'new'
        
        UNION ALL
        
        SELECT 
          'subscription_past_due' as type,
          s.id,
          'Subscription past due for ' || sup.company_name as title,
          s.updated_at as created_at,
          u.first_name || ' ' || u.last_name as user_name
        FROM subscriptions s
        JOIN suppliers sup ON s.supplier_id = sup.id
        JOIN users u ON sup.user_id = u.id
        WHERE s.status = 'past_due'
        
        ORDER BY created_at DESC
        LIMIT 10
      `,

      // Category distribution
      sql`
        SELECT ac.name, COUNT(ma.id) as ad_count
        FROM ad_categories ac
        LEFT JOIN marketplace_ads ma ON ac.id = ma.category_id AND ma.status = 'approved'
        WHERE ac.is_active = true
        GROUP BY ac.id, ac.name
        ORDER BY ad_count DESC
        LIMIT 10
      `,

      // Daily stats for the last 7 days
      sql`
        SELECT 
          DATE(date_series.date) as date,
          COALESCE(stats.new_users, 0) as new_users,
          COALESCE(stats.new_ads, 0) as new_ads,
          COALESCE(stats.new_nominations, 0) as new_nominations,
          COALESCE(stats.revenue_cents, 0) as revenue_cents
        FROM (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '7 days',
            CURRENT_DATE - INTERVAL '1 day',
            '1 day'::interval
          ) as date
        ) date_series
        LEFT JOIN (
          SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT CASE WHEN entity_type = 'user' THEN entity_id END) as new_users,
            COUNT(DISTINCT CASE WHEN entity_type = 'ad' THEN entity_id END) as new_ads,
            COUNT(DISTINCT CASE WHEN entity_type = 'nomination' THEN entity_id END) as new_nominations,
            COALESCE(SUM(CASE WHEN entity_type = 'payment' THEN amount END), 0) as revenue_cents
          FROM (
            SELECT 'user' as entity_type, id as entity_id, created_at, 0 as amount FROM users
            UNION ALL
            SELECT 'ad' as entity_type, id as entity_id, created_at, 0 as amount FROM marketplace_ads
            UNION ALL
            SELECT 'nomination' as entity_type, id as entity_id, created_at, 0 as amount FROM nominations
            UNION ALL
            SELECT 'payment' as entity_type, id as entity_id, created_at, amount FROM payments WHERE status = 'succeeded'
          ) combined
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at)
        ) stats ON DATE(date_series.date) = stats.date
        ORDER BY date
      `,
    ]);

    const [
      mainStats,
      revenueStats,
      topAds,
      recentActivity,
      categoryStats,
      dailyStats,
    ] = dashboardStats;

    // Format the response
    return Response.json({
      kpis: {
        users: {
          total: parseInt(mainStats.total_users),
          suppliers: parseInt(mainStats.total_suppliers),
          admins: parseInt(mainStats.total_admins),
          newInPeriod: parseInt(mainStats.new_users_period),
        },
        marketplace: {
          totalAds: parseInt(mainStats.total_ads),
          liveAds: parseInt(mainStats.live_ads),
          pendingAds: parseInt(mainStats.pending_ads),
          rejectedAds: parseInt(mainStats.rejected_ads),
          newAdsInPeriod: parseInt(mainStats.new_ads_period),
        },
        awards: {
          totalAwards: parseInt(mainStats.total_awards),
          publishedAwards: parseInt(mainStats.published_awards),
          totalNominations: parseInt(mainStats.total_nominations),
          totalTickets: parseInt(mainStats.total_tickets),
        },
        magazine: {
          totalIssues: parseInt(mainStats.total_issues),
          publishedIssues: parseInt(mainStats.published_issues),
          totalArticles: parseInt(mainStats.total_articles),
          publishedArticles: parseInt(mainStats.published_articles),
        },
        concierge: {
          totalRequests: parseInt(mainStats.total_requests),
          newRequests: parseInt(mainStats.new_requests),
          inProgressRequests: parseInt(mainStats.in_progress_requests),
        },
        subscriptions: {
          total: parseInt(mainStats.total_subscriptions),
          active: parseInt(mainStats.active_subscriptions),
          pastDue: parseInt(mainStats.past_due_subscriptions),
        },
        revenue: {
          totalRevenueCents: parseInt(revenueStats.total_revenue_cents),
          periodRevenueCents: parseInt(revenueStats.period_revenue_cents),
          subscriptionRevenueCents: parseInt(
            revenueStats.subscription_revenue_cents,
          ),
          nominationRevenueCents: parseInt(
            revenueStats.nomination_revenue_cents,
          ),
          ticketRevenueCents: parseInt(revenueStats.ticket_revenue_cents),
          successfulPayments: parseInt(revenueStats.successful_payments),
        },
      },
      topPerformingAds: topAds,
      recentActivity: recentActivity,
      categoryDistribution: categoryStats,
      dailyStats: dailyStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return Response.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (user_id) {
      // Get specific supplier by user_id with subscription info
      const [supplier] = await sql`
        SELECT 
          s.*,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          sub.status as subscription_status,
          sub.credits_remaining
        FROM suppliers s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN subscriptions sub ON s.id = sub.supplier_id
        WHERE s.user_id = ${user_id}
      `;

      return Response.json(supplier || null);
    } else {
      // Get all suppliers for admin view
      const suppliers = await sql`
        SELECT 
          s.*,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          COUNT(ma.id) as total_ads,
          COUNT(CASE WHEN ma.status = 'approved' THEN 1 END) as approved_ads,
          COUNT(CASE WHEN ma.status = 'pending' THEN 1 END) as pending_ads,
          sub.status as subscription_status,
          sub.credits_remaining
        FROM suppliers s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN marketplace_ads ma ON s.id = ma.supplier_id
        LEFT JOIN subscriptions sub ON s.id = sub.supplier_id
        GROUP BY s.id, u.email, u.first_name, u.last_name, u.role, sub.status, sub.credits_remaining
        ORDER BY s.created_at DESC
      `;

      return Response.json(suppliers);
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return Response.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      user_id,
      company_name,
      bio,
      website,
      socials = {},
      kyc_status = "pending",
    } = await request.json();

    if (!user_id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const [supplier] = await sql`
      INSERT INTO suppliers (
        user_id, company_name, bio, website, socials, kyc_status,
        created_at, updated_at
      )
      VALUES (
        ${user_id}, ${company_name}, ${bio}, ${website}, 
        ${JSON.stringify(socials)}, ${kyc_status},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return Response.json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return Response.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
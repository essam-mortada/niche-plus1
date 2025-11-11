import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category_id = searchParams.get("category_id");
    const supplier_id = searchParams.get("supplier_id");

    let query = `
      SELECT 
        ma.*,
        ac.name as category_name,
        s.id as supplier_id,
        ma.media as images,
        ma.short_desc as short_description,
        ma.cta_whatsapp as whatsapp_enabled
      FROM marketplace_ads ma 
      LEFT JOIN ad_categories ac ON ma.category_id = ac.id
      LEFT JOIN suppliers s ON ma.supplier_id = s.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND ma.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category_id) {
      query += ` AND ma.category_id = $${paramIndex}`;
      params.push(parseInt(category_id));
      paramIndex++;
    }

    if (supplier_id) {
      query += ` AND ma.supplier_id = $${paramIndex}`;
      params.push(parseInt(supplier_id));
      paramIndex++;
    }

    // Only show non-expired ads for approved status
    if (status === "approved") {
      query += ` AND (ma.expire_at IS NULL OR ma.expire_at > CURRENT_TIMESTAMP)`;
    }

    query += ` ORDER BY ma.created_at DESC`;

    const ads = await sql(query, params);

    return Response.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return Response.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      supplier_id,
      title,
      category_id,
      short_desc,
      long_desc,
      media = [],
      price_label,
      location,
      cta_whatsapp = false,
      whatsapp_number,
    } = await request.json();

    if (!supplier_id || !title || !short_desc) {
      return Response.json(
        { error: "Supplier ID, title, and short description are required" },
        { status: 400 },
      );
    }

    const [ad] = await sql`
      INSERT INTO marketplace_ads (
        supplier_id, title, category_id, short_desc, long_desc, media, 
        price_label, location, cta_whatsapp, whatsapp_number, 
        status, created_at, updated_at
      )
      VALUES (
        ${supplier_id}, ${title}, ${category_id}, ${short_desc}, ${long_desc},
        ${JSON.stringify(media)}, ${price_label}, ${location}, 
        ${cta_whatsapp}, ${whatsapp_number}, 'draft', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return Response.json(ad);
  } catch (error) {
    console.error("Error creating ad:", error);
    return Response.json({ error: "Failed to create ad" }, { status: 500 });
  }
}

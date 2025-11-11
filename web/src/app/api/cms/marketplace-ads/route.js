import sql from "@/app/api/utils/sql";
import {
  getUserFromToken,
  hasPermission,
  logAudit,
} from "@/app/api/utils/auth";
import {
  validateRequired,
  generateSlug,
  validatePaginationParams,
  buildSearchQuery,
} from "@/app/api/utils/validation";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = validatePaginationParams(searchParams);
    const user = await getUserFromToken(request);

    let baseQuery = `
      FROM marketplace_ads ma
      LEFT JOIN ad_categories ac ON ma.category_id = ac.id
      LEFT JOIN suppliers s ON ma.supplier_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
    `;

    let whereConditions = ["1=1"];
    let params = [];
    let paramIndex = 1;

    // Apply role-based filtering
    if (user?.role === "supplier" && user.supplier_id) {
      whereConditions.push(`ma.supplier_id = $${paramIndex}`);
      params.push(user.supplier_id);
      paramIndex++;
    }

    // Search functionality
    const search = searchParams.get("search");
    if (search) {
      whereConditions.push(
        `(LOWER(ma.title) LIKE LOWER($${paramIndex}) OR LOWER(ma.short_desc) LIKE LOWER($${paramIndex + 1}))`,
      );
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    // Status filter
    const status = searchParams.get("status");
    if (status) {
      whereConditions.push(`ma.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Category filter
    const categoryId = searchParams.get("category_id");
    if (categoryId) {
      whereConditions.push(`ma.category_id = $${paramIndex}`);
      params.push(parseInt(categoryId));
      paramIndex++;
    }

    // Date filters
    const dateFrom = searchParams.get("date_from");
    if (dateFrom) {
      whereConditions.push(`ma.created_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    const dateTo = searchParams.get("date_to");
    if (dateTo) {
      whereConditions.push(`ma.created_at <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    // Get ads with related data
    const adsQuery = `
      SELECT ma.*, 
             ac.name as category_name,
             u.first_name, u.last_name, u.email as supplier_email,
             s.company_name,
             (CASE WHEN ma.expire_at < CURRENT_TIMESTAMP THEN true ELSE false END) as is_expired
      ${baseQuery}
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN ma.status = 'pending' THEN 1 ELSE 2 END,
        ma.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const ads = await sql(adsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total ${baseQuery} WHERE ${whereClause}`;
    const [{ total }] = await sql(countQuery, params);

    return Response.json({
      ads,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching marketplace ads:", error);
    return Response.json(
      { error: "Failed to fetch marketplace ads" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    if (!hasPermission(user, "create", "marketplace_ads")) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      category_id,
      short_desc,
      long_desc,
      media = [],
      price_label,
      location,
      cta_quote = false,
      cta_whatsapp = false,
      whatsapp_number,
      status = "draft",
    } = body;

    // Validate required fields
    validateRequired(["title", "category_id", "short_desc"], body);

    // For suppliers, use their supplier_id
    const supplier_id =
      user.role === "supplier" ? user.supplier_id : body.supplier_id;
    if (!supplier_id) {
      return Response.json(
        { error: "Supplier ID is required" },
        { status: 400 },
      );
    }

    // Generate slug
    const slug = generateSlug(title, body.slug);

    // Check for duplicate slug
    const [existingAd] = await sql`
      SELECT id FROM marketplace_ads WHERE slug = ${slug}
    `;
    if (existingAd) {
      return Response.json(
        { error: "Ad with this slug already exists" },
        { status: 400 },
      );
    }

    // Create ad
    const [ad] = await sql`
      INSERT INTO marketplace_ads (
        supplier_id, title, slug, category_id, short_desc, long_desc,
        media, price_label, location, cta_quote, cta_whatsapp, whatsapp_number, status
      )
      VALUES (
        ${supplier_id}, ${title}, ${slug}, ${category_id}, ${short_desc}, ${long_desc},
        ${JSON.stringify(media)}, ${price_label}, ${location}, ${cta_quote}, ${cta_whatsapp}, 
        ${whatsapp_number}, ${status}
      )
      RETURNING *
    `;

    // Log audit
    await logAudit(
      user.id,
      "create",
      "marketplace_ads",
      ad.id,
      null,
      ad,
      request,
    );

    return Response.json(ad, { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace ad:", error);
    return Response.json(
      { error: error.message || "Failed to create marketplace ad" },
      { status: 500 },
    );
  }
}

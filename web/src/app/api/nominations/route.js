import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const award_id = searchParams.get("award_id");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    const offset = (page - 1) * limit;

    // Build where clause
    let whereConditions = ["n.deleted_at IS NULL"];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        LOWER(n.company_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(n.business_description) LIKE LOWER($${paramIndex}) OR
        LOWER(u.first_name) LIKE LOWER($${paramIndex}) OR
        LOWER(u.last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(u.email) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`n.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (award_id) {
      whereConditions.push(`n.award_id = $${paramIndex}`);
      queryParams.push(award_id);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get nominations with user and award info
    const nominationsQuery = `
      SELECT 
        n.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        a.title as award_title,
        a.event_date as award_event_date,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM nominations n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN awards a ON n.award_id = a.id
      LEFT JOIN users reviewer ON n.reviewed_by = reviewer.id
      ${whereClause}
      ORDER BY n.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const nominations = await sql(nominationsQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nominations n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN awards a ON n.award_id = a.id
      ${whereClause}
    `;

    const [{ total }] = await sql(countQuery, queryParams.slice(0, -2));

    return Response.json({
      nominations,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching nominations:", error);
    return Response.json(
      { error: "Failed to fetch nominations" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      user_id,
      award_id,
      nomination_type = "self",
      company_name,
      business_description,
      achievements,
      supporting_documents = [],
    } = body;

    // Validate required fields
    if (!user_id || !award_id || !company_name || !business_description) {
      return Response.json(
        {
          error:
            "User ID, Award ID, company name, and business description are required",
        },
        { status: 400 },
      );
    }

    // Check if user already has a nomination for this award
    const [existingNomination] = await sql`
      SELECT id FROM nominations 
      WHERE user_id = ${user_id} 
      AND award_id = ${award_id} 
      AND status NOT IN ('rejected', 'withdrawn')
      AND deleted_at IS NULL
    `;

    if (existingNomination) {
      return Response.json(
        {
          error:
            "You already have a pending or approved nomination for this award",
        },
        { status: 400 },
      );
    }

    // Create nomination
    const [newNomination] = await sql`
      INSERT INTO nominations (
        user_id,
        award_id,
        nomination_type,
        company_name,
        business_description,
        achievements,
        supporting_documents
      )
      VALUES (
        ${user_id},
        ${award_id},
        ${nomination_type},
        ${company_name},
        ${business_description},
        ${achievements || null},
        ${JSON.stringify(supporting_documents)}
      )
      RETURNING *
    `;

    return Response.json(newNomination, { status: 201 });
  } catch (error) {
    console.error("Error creating nomination:", error);
    return Response.json(
      { error: "Failed to create nomination" },
      { status: 500 },
    );
  }
}

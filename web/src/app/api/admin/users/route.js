import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    const offset = (page - 1) * limit;

    // Build where clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        LOWER(u.email) LIKE LOWER($${paramIndex}) OR 
        LOWER(u.first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(u.last_name) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get users with supplier info
    const usersQuery = `
      SELECT 
        u.*,
        s.id as supplier_id,
        s.subscription_status,
        s.credits_remaining,
        COUNT(a.id) as total_ads,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_ads
      FROM users u
      LEFT JOIN suppliers s ON u.id = s.user_id
      LEFT JOIN marketplace_ads a ON s.id = a.supplier_id
      ${whereClause}
      GROUP BY u.id, s.id, s.subscription_status, s.credits_remaining
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const users = await sql(usersQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN suppliers s ON u.id = s.user_id
      ${whereClause}
    `;

    const [{ total }] = await sql(countQuery, queryParams.slice(0, -2));

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role, first_name, last_name } = body;

    // Validate required fields
    if (!email || !role) {
      return Response.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      const argon2 = await import("argon2");
      passwordHash = await argon2.hash(password);
    }

    // Create user
    const [newUser] = await sql`
      INSERT INTO users (email, password_hash, role, first_name, last_name)
      VALUES (${email}, ${passwordHash}, ${role}, ${first_name || null}, ${
      last_name || null
    })
      RETURNING *
    `;

    // If role is supplier, create supplier record
    if (role === "supplier") {
      await sql`
        INSERT INTO suppliers (user_id, subscription_status, credits_remaining)
        VALUES (${newUser.id}, 'inactive', 0)
      `;
    }

    return Response.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
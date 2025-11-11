import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("featured");
    const published = searchParams.get("published");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    const offset = (page - 1) * limit;

    // Build where clause
    let whereConditions = ["deleted_at IS NULL"]; // Soft delete filter
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        LOWER(title) LIKE LOWER($${paramIndex}) OR 
        LOWER(summary) LIKE LOWER($${paramIndex}) OR 
        LOWER(body_richtext) LIKE LOWER($${paramIndex}) OR
        LOWER(author) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (featured !== null && featured !== undefined) {
      whereConditions.push(`featured = $${paramIndex}`);
      queryParams.push(featured === "true");
      paramIndex++;
    }

    if (published === "true") {
      whereConditions.push(`published_at IS NOT NULL`);
    } else if (published === "false") {
      whereConditions.push(`published_at IS NULL`);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get articles
    const articlesQuery = `
      SELECT *
      FROM articles
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const articles = await sql(articlesQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles
      ${whereClause}
    `;

    const [{ total }] = await sql(countQuery, queryParams.slice(0, -2));

    return Response.json({
      articles,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return Response.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      summary,
      body_richtext,
      hero_image,
      author,
      tags = [],
      featured = false,
      seo_title,
      seo_description,
      publish_now = false,
    } = body;

    // Validate required fields
    if (!title || !body_richtext) {
      return Response.json(
        {
          error: "Title and content are required",
        },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const articleSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const published_at = publish_now ? new Date().toISOString() : null;
    const status = publish_now ? "published" : "draft";

    // Create article
    const [newArticle] = await sql`
      INSERT INTO articles (
        title, 
        slug,
        summary, 
        body_richtext, 
        hero_image, 
        author, 
        tags,
        featured,
        status,
        seo_title,
        seo_description,
        published_at
      )
      VALUES (
        ${title}, 
        ${articleSlug},
        ${summary || null}, 
        ${body_richtext}, 
        ${hero_image || null}, 
        ${author || null}, 
        ${JSON.stringify(tags)},
        ${featured},
        ${status},
        ${seo_title || null},
        ${seo_description || null},
        ${published_at}
      )
      RETURNING *
    `;

    return Response.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return Response.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}

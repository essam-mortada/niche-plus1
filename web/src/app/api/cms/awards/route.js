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
    const { whereClause, params } = buildSearchQuery(searchParams, [
      "name",
      "city",
      "country",
    ]);
    const includeDeleted = searchParams.get("include_deleted") === "true";

    // Build base query
    let query = `
      SELECT a.*, 
             COUNT(ac.id) as category_count,
             COUNT(n.id) as nomination_count,
             COUNT(t.id) as ticket_count
      FROM awards a
      LEFT JOIN award_categories ac ON a.id = ac.award_id
      LEFT JOIN nominations n ON a.id = n.award_id
      LEFT JOIN tickets t ON a.id = t.award_id
      WHERE ${whereClause}
    `;

    if (!includeDeleted) {
      query += " AND a.deleted_at IS NULL";
    }

    query += `
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const awards = await sql(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM awards a
      WHERE ${whereClause}
      ${!includeDeleted ? "AND a.deleted_at IS NULL" : ""}
    `;
    const [{ total }] = await sql(countQuery, params);

    return Response.json({
      awards,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching awards:", error);
    return Response.json({ error: "Failed to fetch awards" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    if (!hasPermission(user, "create", "awards")) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      country,
      city,
      venue,
      event_date,
      cover_image,
      summary,
      long_description,
      status = "draft",
      seo_title,
      seo_description,
      recap_links = [],
    } = body;

    // Validate required fields
    validateRequired(["name", "country", "city", "event_date"], body);

    // Generate slug
    const slug = generateSlug(name, body.slug);

    // Check for duplicate slug
    const [existingAward] = await sql`
      SELECT id FROM awards WHERE slug = ${slug} AND deleted_at IS NULL
    `;
    if (existingAward) {
      return Response.json(
        { error: "Award with this slug already exists" },
        { status: 400 },
      );
    }

    // Create award
    const [award] = await sql`
      INSERT INTO awards (
        name, slug, country, city, venue, event_date, cover_image,
        summary, long_description, status, seo_title, seo_description, recap_links
      )
      VALUES (
        ${name}, ${slug}, ${country}, ${city}, ${venue}, ${event_date}, ${cover_image},
        ${summary}, ${long_description}, ${status}, ${seo_title}, ${seo_description}, ${JSON.stringify(recap_links)}
      )
      RETURNING *
    `;

    // Log audit
    await logAudit(user.id, "create", "awards", award.id, null, award, request);

    return Response.json(award, { status: 201 });
  } catch (error) {
    console.error("Error creating award:", error);
    return Response.json(
      { error: error.message || "Failed to create award" },
      { status: 500 },
    );
  }
}

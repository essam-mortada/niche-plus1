import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "Award ID is required" }, { status: 400 });
    }

    const [award] = await sql`
      SELECT 
        a.*,
        CASE 
          WHEN a.event_date < CURRENT_DATE THEN 'completed'
          WHEN a.event_date = CURRENT_DATE THEN 'ongoing'
          ELSE 'upcoming'
        END as computed_status
      FROM awards a
      WHERE a.id = ${id} AND a.deleted_at IS NULL
    `;

    if (!award) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    // Use computed status if the database status doesn't reflect current state
    if (award.computed_status !== award.status) {
      award.status = award.computed_status;
    }

    return Response.json(award);
  } catch (error) {
    console.error("Error fetching award:", error);
    return Response.json({ error: "Failed to fetch award" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    if (!id) {
      return Response.json({ error: "Award ID is required" }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "slug",
      "country",
      "city",
      "venue",
      "event_date",
      "cover_image",
      "summary",
      "long_description",
      "status",
      "seo_title",
      "seo_description",
      "recap_links",
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const [updatedAward] = await sql(
      `UPDATE awards SET ${updateFields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );

    if (!updatedAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    return Response.json(updatedAward);
  } catch (error) {
    console.error("Error updating award:", error);
    return Response.json({ error: "Failed to update award" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "Award ID is required" }, { status: 400 });
    }

    const [deletedAward] = await sql`
      UPDATE awards 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id
    `;

    if (!deletedAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    return Response.json({ message: "Award deleted successfully" });
  } catch (error) {
    console.error("Error deleting award:", error);
    return Response.json({ error: "Failed to delete award" }, { status: 500 });
  }
}

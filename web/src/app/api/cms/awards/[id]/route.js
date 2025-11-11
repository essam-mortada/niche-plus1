import sql from "@/app/api/utils/sql";
import {
  getUserFromToken,
  hasPermission,
  logAudit,
} from "@/app/api/utils/auth";
import { validateRequired, generateSlug } from "@/app/api/utils/validation";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [award] = await sql`
      SELECT a.*, 
             COUNT(ac.id) as category_count,
             COUNT(n.id) as nomination_count,
             COUNT(t.id) as ticket_count
      FROM awards a
      LEFT JOIN award_categories ac ON a.id = ac.award_id
      LEFT JOIN nominations n ON a.id = n.award_id
      LEFT JOIN tickets t ON a.id = t.award_id
      WHERE a.id = ${id} AND a.deleted_at IS NULL
      GROUP BY a.id
    `;

    if (!award) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    // Get categories for this award
    const categories = await sql`
      SELECT * FROM award_categories 
      WHERE award_id = ${id} 
      ORDER BY sort_order, name
    `;

    return Response.json({ award, categories });
  } catch (error) {
    console.error("Error fetching award:", error);
    return Response.json({ error: "Failed to fetch award" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const user = await getUserFromToken(request);

    // Get existing award for permission check
    const [existingAward] = await sql`
      SELECT * FROM awards WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    if (!hasPermission(user, "update", "awards", existingAward)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Build update fields dynamically
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    const fieldsToUpdate = [
      "name",
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
    ];

    fieldsToUpdate.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateParams.push(body[field]);
        paramIndex++;
      }
    });

    // Handle slug generation for name changes
    if (body.name !== undefined && body.name !== existingAward.name) {
      const newSlug = generateSlug(body.name, body.slug);
      if (newSlug !== existingAward.slug) {
        // Check for duplicate slug
        const [duplicateAward] = await sql`
          SELECT id FROM awards WHERE slug = ${newSlug} AND id != ${id} AND deleted_at IS NULL
        `;
        if (duplicateAward) {
          return Response.json(
            { error: "Award with this slug already exists" },
            { status: 400 },
          );
        }
        updateFields.push(`slug = $${paramIndex}`);
        updateParams.push(newSlug);
        paramIndex++;
      }
    }

    // Handle recap_links JSON field
    if (body.recap_links !== undefined) {
      updateFields.push(`recap_links = $${paramIndex}`);
      updateParams.push(JSON.stringify(body.recap_links));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateParams.push(id);

    const updateQuery = `
      UPDATE awards 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [updatedAward] = await sql(updateQuery, updateParams);

    // Log audit
    await logAudit(
      user.id,
      "update",
      "awards",
      id,
      existingAward,
      updatedAward,
      request,
    );

    return Response.json(updatedAward);
  } catch (error) {
    console.error("Error updating award:", error);
    return Response.json(
      { error: error.message || "Failed to update award" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const user = await getUserFromToken(request);

    // Get existing award for permission check
    const [existingAward] = await sql`
      SELECT * FROM awards WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingAward) {
      return Response.json({ error: "Award not found" }, { status: 404 });
    }

    if (!hasPermission(user, "delete", "awards", existingAward)) {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Soft delete
    await sql`
      UPDATE awards 
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Log audit
    await logAudit(
      user.id,
      "delete",
      "awards",
      id,
      existingAward,
      null,
      request,
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting award:", error);
    return Response.json({ error: "Failed to delete award" }, { status: 500 });
  }
}

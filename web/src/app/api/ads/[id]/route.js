import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [ad] = await sql`
      SELECT 
        a.*,
        c.name as category_name,
        s.id as supplier_id,
        u.email as supplier_email,
        u.first_name,
        u.last_name
      FROM marketplace_ads a 
      LEFT JOIN ad_categories c ON a.category_id = c.id
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE a.id = ${id}
    `;

    if (!ad) {
      return Response.json({ error: "Ad not found" }, { status: 404 });
    }

    return Response.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return Response.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      title,
      category_id,
      short_description,
      images,
      price_label,
      location,
      whatsapp_enabled,
      whatsapp_number,
      status,
      rejection_reason,
    } = body;

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }
    if (short_description !== undefined) {
      updateFields.push(`short_description = $${paramIndex}`);
      values.push(short_description);
      paramIndex++;
    }
    if (images !== undefined) {
      updateFields.push(`images = $${paramIndex}`);
      values.push(JSON.stringify(images));
      paramIndex++;
    }
    if (price_label !== undefined) {
      updateFields.push(`price_label = $${paramIndex}`);
      values.push(price_label);
      paramIndex++;
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex}`);
      values.push(location);
      paramIndex++;
    }
    if (whatsapp_enabled !== undefined) {
      updateFields.push(`whatsapp_enabled = $${paramIndex}`);
      values.push(whatsapp_enabled);
      paramIndex++;
    }
    if (whatsapp_number !== undefined) {
      updateFields.push(`whatsapp_number = $${paramIndex}`);
      values.push(whatsapp_number);
      paramIndex++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;

      // Handle status-specific updates
      if (status === "approved") {
        updateFields.push(`approved_at = CURRENT_TIMESTAMP`);
        updateFields.push(
          `expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days'`
        );
        updateFields.push(`rejection_reason = NULL`);
      } else if (status === "rejected" && rejection_reason) {
        updateFields.push(`rejection_reason = $${paramIndex}`);
        values.push(rejection_reason);
        paramIndex++;
        updateFields.push(`approved_at = NULL`);
        updateFields.push(`expires_at = NULL`);
      }
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE marketplace_ads 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [updatedAd] = await sql(query, values);

    /* // If approved, deduct credit from supplier
    if (status === "approved") {
      await sql`
        UPDATE suppliers 
        SET credits_remaining = credits_remaining - 1 
        WHERE id = ${updatedAd.supplier_id} AND credits_remaining > 0
      `;
    }
*/
    return Response.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    return Response.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await sql`DELETE FROM marketplace_ads WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return Response.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
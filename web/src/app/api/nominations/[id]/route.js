import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [nomination] = await sql`
      SELECT 
        n.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        a.title as award_title,
        a.description as award_description,
        a.event_date as award_event_date,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM nominations n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN awards a ON n.award_id = a.id
      LEFT JOIN users reviewer ON n.reviewed_by = reviewer.id
      WHERE n.id = ${id} AND n.deleted_at IS NULL
    `;

    if (!nomination) {
      return Response.json({ error: "Nomination not found" }, { status: 404 });
    }

    return Response.json(nomination);
  } catch (error) {
    console.error("Error fetching nomination:", error);
    return Response.json(
      { error: "Failed to fetch nomination" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      company_name,
      business_description,
      achievements,
      supporting_documents,
    } = body;

    // Check if nomination exists and is editable
    const [existingNomination] = await sql`
      SELECT * FROM nominations 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingNomination) {
      return Response.json({ error: "Nomination not found" }, { status: 404 });
    }

    // Only allow editing if status is pending
    if (existingNomination.status !== "pending") {
      return Response.json(
        {
          error: "Cannot edit nomination after it has been reviewed",
        },
        { status: 400 },
      );
    }

    // Validate required fields
    if (!company_name || !business_description) {
      return Response.json(
        {
          error: "Company name and business description are required",
        },
        { status: 400 },
      );
    }

    // Update nomination
    const [updatedNomination] = await sql`
      UPDATE nominations 
      SET 
        company_name = ${company_name},
        business_description = ${business_description},
        achievements = ${achievements || null},
        supporting_documents = ${JSON.stringify(supporting_documents || [])},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    return Response.json(updatedNomination);
  } catch (error) {
    console.error("Error updating nomination:", error);
    return Response.json(
      { error: "Failed to update nomination" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Check if nomination exists
    const [existingNomination] = await sql`
      SELECT * FROM nominations 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingNomination) {
      return Response.json({ error: "Nomination not found" }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete - permanently remove
      await sql`DELETE FROM nominations WHERE id = ${id}`;
      return Response.json({ message: "Nomination permanently deleted" });
    } else {
      // Soft delete - withdraw nomination
      const [deletedNomination] = await sql`
        UPDATE nominations 
        SET 
          status = 'withdrawn',
          deleted_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING *
      `;

      return Response.json({
        message: "Nomination withdrawn successfully",
        nomination: deletedNomination,
      });
    }
  } catch (error) {
    console.error("Error deleting nomination:", error);
    return Response.json(
      { error: "Failed to delete nomination" },
      { status: 500 },
    );
  }
}

// Handle nomination approval/rejection
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, reviewer_id, rejection_reason, score } = body;

    // Check if nomination exists
    const [existingNomination] = await sql`
      SELECT * FROM nominations 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingNomination) {
      return Response.json({ error: "Nomination not found" }, { status: 404 });
    }

    let updatedNomination;

    switch (action) {
      case "approve":
        updatedNomination = await sql`
          UPDATE nominations 
          SET 
            status = 'approved',
            reviewed_at = CURRENT_TIMESTAMP,
            reviewed_by = ${reviewer_id},
            score = ${score || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND deleted_at IS NULL
          RETURNING *
        `;
        break;

      case "reject":
        if (!rejection_reason) {
          return Response.json(
            {
              error: "Rejection reason is required",
            },
            { status: 400 },
          );
        }

        updatedNomination = await sql`
          UPDATE nominations 
          SET 
            status = 'rejected',
            reviewed_at = CURRENT_TIMESTAMP,
            reviewed_by = ${reviewer_id},
            rejection_reason = ${rejection_reason},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND deleted_at IS NULL
          RETURNING *
        `;
        break;

      case "under_review":
        updatedNomination = await sql`
          UPDATE nominations 
          SET 
            status = 'under_review',
            reviewed_by = ${reviewer_id},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND deleted_at IS NULL
          RETURNING *
        `;
        break;

      case "restore":
        // Restore withdrawn nomination
        updatedNomination = await sql`
          UPDATE nominations 
          SET 
            status = 'pending',
            deleted_at = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND status = 'withdrawn'
          RETURNING *
        `;
        break;

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!updatedNomination || updatedNomination.length === 0) {
      return Response.json(
        { error: "Failed to update nomination" },
        { status: 400 },
      );
    }

    return Response.json({
      message: `Nomination ${action}d successfully`,
      nomination: updatedNomination[0],
    });
  } catch (error) {
    console.error("Error updating nomination status:", error);
    return Response.json(
      { error: "Failed to update nomination" },
      { status: 500 },
    );
  }
}

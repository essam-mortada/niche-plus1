import sql from "@/app/api/utils/sql";
import { getUserFromToken, requireRole, logAudit } from "@/app/api/utils/auth";
import { validateRequired } from "@/app/api/utils/validation";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const user = await getUserFromToken(request);
    requireRole(user, "admin");

    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'reject'

    validateRequired(["action"], body);

    if (action === "reject" && !reason) {
      return Response.json(
        { error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    // Get the ad and supplier info
    const [ad] = await sql`
      SELECT ma.*, s.id as supplier_id, sub.credits_used, sub.credits_total, sub.status as subscription_status
      FROM marketplace_ads ma
      JOIN suppliers s ON ma.supplier_id = s.id
      LEFT JOIN subscriptions sub ON s.id = sub.supplier_id
      WHERE ma.id = ${id}
    `;

    if (!ad) {
      return Response.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.status !== "pending") {
      return Response.json(
        { error: "Ad is not in pending status" },
        { status: 400 },
      );
    }

    let updatedAd;

    if (action === "approve") {
      // Check if supplier has credits and active subscription
      if (!ad.subscription_status || ad.subscription_status !== "active") {
        return Response.json(
          {
            error: "Supplier must have an active subscription to approve ads",
          },
          { status: 400 },
        );
      }

      const creditsRemaining = (ad.credits_total || 0) - (ad.credits_used || 0);
      if (creditsRemaining < 1) {
        return Response.json(
          {
            error: "Supplier has insufficient credits to approve this ad",
          },
          { status: 400 },
        );
      }

      // Start transaction for approval
      const results = await sql.transaction([
        // Consume 1 credit
        sql`
          UPDATE subscriptions 
          SET credits_used = credits_used + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE supplier_id = ${ad.supplier_id}
        `,

        // Approve ad and set expiration (30 days from now)
        sql`
          UPDATE marketplace_ads
          SET status = 'approved',
              go_live_at = CURRENT_TIMESTAMP,
              expire_at = CURRENT_TIMESTAMP + INTERVAL '30 days',
              moderation_reason = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `,
      ]);

      updatedAd = results[1][0];
    } else if (action === "reject") {
      // Reject ad (does not consume credits)
      [updatedAd] = await sql`
        UPDATE marketplace_ads
        SET status = 'rejected',
            moderation_reason = ${reason},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      return Response.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    // Log audit
    await logAudit(
      user.id,
      `moderate_${action}`,
      "marketplace_ads",
      id,
      ad,
      updatedAd,
      request,
    );

    // TODO: Send notification to supplier about moderation decision

    return Response.json({
      ad: updatedAd,
      message: `Ad ${action === "approve" ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("Error moderating ad:", error);
    return Response.json(
      { error: error.message || "Failed to moderate ad" },
      { status: 500 },
    );
  }
}

// Bulk moderation endpoint
export async function PUT(request, { params }) {
  try {
    const user = await getUserFromToken(request);
    requireRole(user, "admin");

    const body = await request.json();
    const { adIds, action, reason } = body;

    validateRequired(["adIds", "action"], body);

    if (action === "reject" && !reason) {
      return Response.json(
        { error: "Rejection reason is required for bulk rejection" },
        { status: 400 },
      );
    }

    const results = {
      approved: [],
      rejected: [],
      errors: [],
    };

    for (const adId of adIds) {
      try {
        // Process each ad individually for better error handling
        const moderationRequest = new Request(request.url, {
          method: "POST",
          body: JSON.stringify({ action, reason }),
          headers: request.headers,
        });

        const response = await POST(moderationRequest, {
          params: { id: adId },
        });
        const responseData = await response.json();

        if (response.ok) {
          if (action === "approve") {
            results.approved.push(responseData.ad);
          } else {
            results.rejected.push(responseData.ad);
          }
        } else {
          results.errors.push({ adId, error: responseData.error });
        }
      } catch (error) {
        results.errors.push({ adId, error: error.message });
      }
    }

    return Response.json({
      results,
      summary: {
        total: adIds.length,
        approved: results.approved.length,
        rejected: results.rejected.length,
        errors: results.errors.length,
      },
    });
  } catch (error) {
    console.error("Error in bulk moderation:", error);
    return Response.json(
      { error: error.message || "Failed to bulk moderate ads" },
      { status: 500 },
    );
  }
}

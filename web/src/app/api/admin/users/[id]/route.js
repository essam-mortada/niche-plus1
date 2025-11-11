import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [user] = await sql`
      SELECT 
        u.*,
        s.id as supplier_id,
        s.subscription_status,
        s.credits_remaining,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.credits_reset_date
      FROM users u
      LEFT JOIN suppliers s ON u.id = s.user_id
      WHERE u.id = ${id}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's ads if they're a supplier
    let ads = [];
    if (user.supplier_id) {
      ads = await sql`
        SELECT 
          a.*,
          c.name as category_name
        FROM ads a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.supplier_id = ${user.supplier_id}
        ORDER BY a.created_at DESC
      `;
    }

    // Get user's requests
    const requests = await sql`
      SELECT *
      FROM requests
      WHERE user_id = ${id}
      ORDER BY created_at DESC
    `;

    return Response.json({
      user,
      ads,
      requests,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      email,
      role,
      first_name,
      last_name,
      password,
      subscription_status,
      credits_remaining,
    } = body;

    // Build user update fields
    const userUpdateFields = [];
    const userValues = [];
    let userParamIndex = 1;

    if (email !== undefined) {
      userUpdateFields.push(`email = $${userParamIndex}`);
      userValues.push(email);
      userParamIndex++;
    }
    if (role !== undefined) {
      userUpdateFields.push(`role = $${userParamIndex}`);
      userValues.push(role);
      userParamIndex++;
    }
    if (first_name !== undefined) {
      userUpdateFields.push(`first_name = $${userParamIndex}`);
      userValues.push(first_name);
      userParamIndex++;
    }
    if (last_name !== undefined) {
      userUpdateFields.push(`last_name = $${userParamIndex}`);
      userValues.push(last_name);
      userParamIndex++;
    }
    if (password !== undefined && password.trim()) {
      const argon2 = await import("argon2");
      const passwordHash = await argon2.hash(password);
      userUpdateFields.push(`password_hash = $${userParamIndex}`);
      userValues.push(passwordHash);
      userParamIndex++;
    }

    userUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    userValues.push(id);

    // Update user
    const userUpdateQuery = `
      UPDATE users 
      SET ${userUpdateFields.join(", ")}
      WHERE id = $${userParamIndex}
      RETURNING *
    `;

    const [updatedUser] = await sql(userUpdateQuery, userValues);

    // Handle supplier-specific updates
    if (
      role === "supplier" &&
      (subscription_status !== undefined || credits_remaining !== undefined)
    ) {
      // Check if supplier record exists
      const [existingSupplier] = await sql`
        SELECT id FROM suppliers WHERE user_id = ${id}
      `;

      if (existingSupplier) {
        // Update supplier
        const supplierUpdateFields = [];
        const supplierValues = [];
        let supplierParamIndex = 1;

        if (subscription_status !== undefined) {
          supplierUpdateFields.push(
            `subscription_status = $${supplierParamIndex}`,
          );
          supplierValues.push(subscription_status);
          supplierParamIndex++;
        }
        if (credits_remaining !== undefined) {
          supplierUpdateFields.push(
            `credits_remaining = $${supplierParamIndex}`,
          );
          supplierValues.push(credits_remaining);
          supplierParamIndex++;
        }

        supplierUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        supplierValues.push(existingSupplier.id);

        const supplierUpdateQuery = `
          UPDATE suppliers 
          SET ${supplierUpdateFields.join(", ")}
          WHERE id = $${supplierParamIndex}
        `;

        await sql(supplierUpdateQuery, supplierValues);
      } else {
        // Create supplier record
        await sql`
          INSERT INTO suppliers (user_id, subscription_status, credits_remaining)
          VALUES (${id}, ${subscription_status || "inactive"}, ${credits_remaining || 0})
        `;
      }
    }

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Delete user (cascading deletes will handle related records)
    await sql`DELETE FROM users WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

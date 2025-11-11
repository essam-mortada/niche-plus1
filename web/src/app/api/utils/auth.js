import sql from "./sql.js";

export async function getUserFromToken(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return null;

    // Simple token validation - in production, use proper JWT verification
    const [user] = await sql`
      SELECT u.*, s.id as supplier_id, s.kyc_status
      FROM users u
      LEFT JOIN suppliers s ON u.id = s.user_id
      WHERE u.id = ${parseInt(token)}
    `;

    return user || null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export function hasPermission(user, action, entity, entityData = null) {
  if (!user) return false;

  // Admin can do everything
  if (user.role === "admin") return true;

  // Supplier permissions
  if (user.role === "supplier") {
    switch (entity) {
      case "awards":
        // Suppliers can read awards but not modify them
        return action === "read";

      case "marketplace_ads":
        if (action === "create") return true;
        if (["read", "update", "delete"].includes(action)) {
          return entityData?.supplier_id === user.supplier_id;
        }
        return false;

      case "subscriptions":
      case "payments":
        return (
          action === "read" && entityData?.supplier_id === user.supplier_id
        );

      case "nominations":
      case "tickets":
        return (
          ["create", "read"].includes(action) && entityData?.user_id === user.id
        );

      default:
        return action === "read";
    }
  }

  // Public user permissions
  if (user.role === "public") {
    switch (entity) {
      case "awards":
        // Public users can only read awards
        return action === "read";

      case "nominations":
      case "tickets":
      case "concierge_requests":
        return (
          ["create", "read"].includes(action) && entityData?.user_id === user.id
        );

      default:
        return action === "read";
    }
  }

  return false;
}

export function requireAuth(user) {
  if (!user) {
    throw new Error("Authentication required");
  }
}

export function requireRole(user, requiredRole) {
  requireAuth(user);
  if (user.role !== requiredRole && user.role !== "admin") {
    throw new Error("Insufficient permissions");
  }
}

export async function logAudit(
  userId,
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  request = null,
) {
  try {
    const ipAddress =
      request?.headers.get("x-forwarded-for") ||
      request?.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request?.headers.get("user-agent") || "unknown";

    await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES (${userId}, ${action}, ${entityType}, ${entityId}, ${JSON.stringify(oldValues)}, ${JSON.stringify(newValues)}, ${ipAddress}, ${userAgent})
    `;
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

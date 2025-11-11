import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const user_id = searchParams.get("user_id");

    let query = `
      SELECT 
        cr.*,
        u.first_name,
        u.last_name,
        u.email
      FROM concierge_requests cr 
      LEFT JOIN users u ON cr.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND cr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (user_id) {
      query += ` AND cr.user_id = $${paramIndex}`;
      params.push(parseInt(user_id));
      paramIndex++;
    }

    query += ` ORDER BY cr.created_at DESC`;

    const requests = await sql(query, params);

    return Response.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return Response.json(
      { error: "Failed to fetch requests" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      user_id = null,
      name,
      email,
      phone,
      message,
      source = "app",
      service_type,
      description,
      budget_range,
      contact_preference = "email",
      phone_number,
    } = await request.json();

    // Support both old format (service_type/description) and new format (name/email/message)
    const finalName = name || "App User";
    const finalEmail = email || "noreply@example.com";
    const finalMessage =
      message ||
      `Service Type: ${service_type}\n\nDescription: ${description}\n\nBudget Range: ${budget_range}`;
    const finalPhone = phone || phone_number;

    if (!finalMessage && !description) {
      return Response.json(
        { error: "Message or description is required" },
        { status: 400 },
      );
    }

    const [serviceRequest] = await sql`
      INSERT INTO concierge_requests (
        user_id, name, email, phone, message, source, 
        status, created_at, updated_at
      )
      VALUES (
        ${user_id}, ${finalName}, ${finalEmail}, ${finalPhone}, ${finalMessage}, ${source},
        'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return Response.json(serviceRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return Response.json(
      { error: "Failed to create request" },
      { status: 500 },
    );
  }
}

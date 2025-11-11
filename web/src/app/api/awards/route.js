import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const awards = await sql`
      SELECT * FROM awards 
      ORDER BY 
        CASE 
          WHEN status = 'upcoming' THEN 1
          WHEN status = 'ongoing' THEN 2
          ELSE 3
        END,
        event_date DESC
    `;

    return Response.json(awards);
  } catch (error) {
    console.error("Error fetching awards:", error);
    return Response.json({ error: "Failed to fetch awards" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      name,
      summary,
      long_description,
      conutry,
      city,
      venue,
      event_date,
      cover_image,
      seo_title,
      seo_description,
      recap_links,
      status = "upcoming",
    } = await request.json();

    if (!title || !location || !event_date) {
      return Response.json(
        { error: "Title, location, and event date are required" },
        { status: 400 }
      );
    }

    const [award] = await sql`
      INSERT INTO awards (title, description, location, event_date, image, status)
      VALUES (${title}, ${description}, ${location}, ${event_date}, ${image}, ${status})
      RETURNING *
    `;

    return Response.json(award);
  } catch (error) {
    console.error("Error creating award:", error);
    return Response.json({ error: "Failed to create award" }, { status: 500 });
  }
}
import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [category] = await sql`
      SELECT * FROM categories WHERE id = ${id}
    `;

    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    // Get category stats
    const [stats] = await sql`
      SELECT 
        COUNT(a.id) as total_ads,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_ads,
        COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_ads
      FROM ads a
      WHERE a.category_id = ${id}
    `;

    return Response.json({
      ...category,
      stats,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return Response.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const [updatedCategory] = await sql`
      UPDATE categories 
      SET name = ${name}, description = ${description || null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedCategory) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    return Response.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return Response.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if category has ads
    const [adsCount] = await sql`
      SELECT COUNT(*) as count FROM ads WHERE category_id = ${id}
    `;

    if (parseInt(adsCount.count) > 0) {
      return Response.json(
        { error: "Cannot delete category with existing ads" },
        { status: 400 },
      );
    }

    await sql`DELETE FROM categories WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}

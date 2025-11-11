import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [article] = await sql`
      SELECT * FROM articles 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    return Response.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return Response.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      title,
      slug,
      summary,
      body_richtext,
      hero_image,
      author,
      tags = [],
      featured = false,
      seo_title,
      seo_description,
      publish_now,
    } = body;

    // Check if article exists
    const [existingArticle] = await sql`
      SELECT * FROM articles 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingArticle) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    // Validate required fields
    if (!title || !body_richtext) {
      return Response.json(
        {
          error: "Title and content are required",
        },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const articleSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Handle publishing logic
    let published_at = existingArticle.published_at;
    let status = existingArticle.status;

    if (publish_now && !published_at) {
      published_at = new Date().toISOString();
      status = "published";
    } else if (publish_now === false) {
      published_at = null;
      status = "draft";
    }

    // Update article
    const [updatedArticle] = await sql`
      UPDATE articles 
      SET 
        title = ${title},
        slug = ${articleSlug},
        summary = ${summary || null},
        body_richtext = ${body_richtext},
        hero_image = ${hero_image || null},
        author = ${author || null},
        tags = ${JSON.stringify(tags)},
        featured = ${featured},
        status = ${status},
        seo_title = ${seo_title || null},
        seo_description = ${seo_description || null},
        published_at = ${published_at},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    return Response.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    return Response.json(
      { error: "Failed to update article" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Check if article exists
    const [existingArticle] = await sql`
      SELECT * FROM articles 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (!existingArticle) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete - permanently remove from database
      await sql`DELETE FROM articles WHERE id = ${id}`;
      return Response.json({ message: "Article permanently deleted" });
    } else {
      // Soft delete - mark as deleted
      const [deletedArticle] = await sql`
        UPDATE articles 
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING *
      `;

      return Response.json({
        message: "Article moved to trash",
        article: deletedArticle,
      });
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    return Response.json(
      { error: "Failed to delete article" },
      { status: 500 },
    );
  }
}

// Restore soft-deleted article
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (action === "restore") {
      // Restore soft-deleted article
      const [restoredArticle] = await sql`
        UPDATE articles 
        SET deleted_at = NULL
        WHERE id = ${id} AND deleted_at IS NOT NULL
        RETURNING *
      `;

      if (!restoredArticle) {
        return Response.json(
          { error: "Article not found in trash" },
          { status: 404 },
        );
      }

      return Response.json({
        message: "Article restored successfully",
        article: restoredArticle,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error restoring article:", error);
    return Response.json(
      { error: "Failed to restore article" },
      { status: 500 },
    );
  }
}

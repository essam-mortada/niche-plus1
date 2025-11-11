import upload from "@/app/api/utils/upload";

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.uri) {
      // Handle file URI from mobile
      const response = await fetch(body.uri);
      const buffer = await response.arrayBuffer();
      const result = await upload({ buffer: Buffer.from(buffer) });
      return Response.json(result);
    }

    if (body.base64) {
      const result = await upload({ base64: body.base64 });
      return Response.json(result);
    }

    if (body.url) {
      const result = await upload({ url: body.url });
      return Response.json(result);
    }

    return Response.json(
      { error: "No valid upload data provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

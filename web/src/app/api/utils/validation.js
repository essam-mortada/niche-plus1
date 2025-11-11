export function validateRequired(fields, data) {
  const missing = [];
  for (const field of fields) {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
}

export function validateSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    throw new Error(
      "Invalid slug format. Use lowercase letters, numbers, and hyphens only",
    );
  }
}

export function generateSlug(title, existingSlug = null) {
  if (existingSlug) return existingSlug;

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
}

export function validateFileType(
  filename,
  allowedTypes = ["jpg", "jpeg", "png", "webp"],
) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!allowedTypes.includes(ext)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
  }
}

export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Start date must be before end date");
  }
}

export function sanitizeInput(input) {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  return input;
}

export function validatePaginationParams(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20")),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildSearchQuery(searchParams, searchableFields = []) {
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const category_id = searchParams.get("category_id");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");

  let whereConditions = ["1=1"];
  let params = [];
  let paramIndex = 1;

  if (search && searchableFields.length > 0) {
    const searchConditions = searchableFields
      .map(() => {
        const condition = `LOWER($${paramIndex}) LIKE LOWER($${paramIndex + 1})`;
        paramIndex += 2;
        return condition;
      })
      .join(" OR ");

    whereConditions.push(`(${searchConditions})`);
    searchableFields.forEach((field) => {
      params.push(field, `%${search}%`);
    });
  }

  if (status) {
    whereConditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (category_id) {
    whereConditions.push(`category_id = $${paramIndex}`);
    params.push(parseInt(category_id));
    paramIndex++;
  }

  if (date_from) {
    whereConditions.push(`created_at >= $${paramIndex}`);
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    whereConditions.push(`created_at <= $${paramIndex}`);
    params.push(date_to);
    paramIndex++;
  }

  return {
    whereClause: whereConditions.join(" AND "),
    params,
    search,
    status,
    category_id,
    date_from,
    date_to,
  };
}

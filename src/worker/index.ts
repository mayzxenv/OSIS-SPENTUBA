import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cors } from "hono/cors";

interface Env {
  DB: any;
  ADMIN_ACCESS_CODE?: string;
}

const DEFAULT_ADMIN_CODE = "OSIS2024";

function parseStoredList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return [value].filter((item) => item.trim().length > 0);
    }
  }

  return [];
}

function mapAlbumRow(row: any) {
  return {
    ...row,
    photos: parseStoredList(row?.photos_json ?? row?.photos),
    videos: parseStoredList(row?.videos_json ?? row?.videos),
    visibility_days: row?.visibility_days === null || row?.visibility_days === undefined ? null : Number(row.visibility_days),
    expires_at: row?.expires_at || null,
    likes: Number(row?.likes || 0),
    comments_count: Number(row?.comments_count || 0),
    shares: Number(row?.shares || 0),
  };
}

function parseVisibilityDays(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (parsed === 1 || parsed === 7 || parsed === 30) {
    return parsed;
  }

  return null;
}

function computeExpiresAtIso(visibilityDays: number | null): string | null {
  if (!visibilityDays) {
    return null;
  }

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + visibilityDays);
  return expiresAt.toISOString();
}

function normalizeReportCategory(value: unknown): string {
  const allowed = new Set(["teman_curhat", "laporan_pelanggaran", "laporan_bullying"]);
  const normalized = typeof value === "string" ? value.trim() : "";
  return allowed.has(normalized) ? normalized : "laporan_bullying";
}

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Admin-Code"],
  })
);

// OAuth compatibility endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  return c.json({ redirectUrl: "#" }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  // Temporary session token while full OAuth is being wired.
  const sessionToken = "session-token";

  setCookie(c, "SESSION_TOKEN", sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", async (c) => {
  // Temporary profile payload for compatibility with current frontend login flow.
  return c.json({
    id: "user",
    email: "user@example.com",
    name: "Pengguna OSIS"
  });
});

app.get("/api/logout", async (c) => {
  setCookie(c, "SESSION_TOKEN", "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Admin code verification endpoint
app.post("/api/admin/verify-code", async (c) => {
  const body = await c.req.json<{ code: string }>();
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const userCode = (body.code || "").trim();

  if (userCode === adminCode) {
    return c.json({ success: true }, 200);
  }
  return c.json({ error: "Invalid admin code" }, 401);
});

// Appreciations endpoints
// POST - No auth required, accepts from_user_name from frontend
app.post("/api/appreciations", async (c) => {
  const body = await c.req.json<{
    from_user_name: string;
    to_name: string;
    type: string;
    message?: string;
    is_anonymous?: boolean;
  }>();

  const isAnonymous = Boolean(body.is_anonymous);
  const toName = (body.to_name || "").trim();
  const fromUserName = (body.from_user_name || "").trim();

  if (!toName || (!isAnonymous && !fromUserName)) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
     `INSERT INTO appreciations (from_user_id, from_user_name, to_name, type, message, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      "guest",
      isAnonymous ? "Anonim" : fromUserName,
      toName,
      body.type,
      body.message || "",
      isAnonymous ? 1 : 0
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

app.get("/api/appreciations", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM appreciations ORDER BY created_at DESC LIMIT 50"
  ).all();

  return c.json(results);
});

app.get("/api/appreciations/leaderboard", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT to_name, COUNT(*) as count
     FROM appreciations
     WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
     GROUP BY to_name
     ORDER BY count DESC
     LIMIT 10`
  ).all();

  return c.json(results);
});

// DELETE appreciation (admin only)
app.delete("/api/appreciations/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM appreciations WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Ideas endpoints
app.post("/api/ideas", async (c) => {
  const body = await c.req.json<{
    user_name: string;
    title: string;
    description: string;
    category: string;
  }>();

  if (!body.title.trim() || !body.user_name.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO ideas (user_id, user_name, title, description, category)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      "guest",
      body.user_name,
      body.title,
      body.description,
      body.category
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

app.get("/api/ideas", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM ideas ORDER BY votes DESC, created_at DESC"
  ).all();

  return c.json(results);
});

// DELETE idea (admin only)
app.delete("/api/ideas/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM ideas WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Forum threads endpoints
app.post("/api/forum/threads", async (c) => {
  const body = await c.req.json<{
    user_name: string;
    user_avatar?: string;
    title: string;
    content: string;
    category: string;
  }>();

  if (!body.title.trim() || !body.user_name.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO forum_threads (user_id, user_name, user_avatar, title, content, category)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      "guest",
      body.user_name,
      body.user_avatar || "",
      body.title,
      body.content,
      body.category
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

app.get("/api/forum/threads", async (c) => {
  const category = c.req.query("category");
  
  let query = "SELECT * FROM forum_threads";
  const params: string[] = [];
  
  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }
  
  query += " ORDER BY is_pinned DESC, created_at DESC";
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(results);
});

// DELETE forum thread (admin only)
app.delete("/api/forum/threads/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM forum_replies WHERE thread_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM forum_threads WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

app.post("/api/forum/threads/:id/like", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE forum_threads SET likes = COALESCE(likes, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  const thread = await c.env.DB.prepare("SELECT * FROM forum_threads WHERE id = ?").bind(id).first();
  return c.json({ success: true, thread }, 200);
});

app.get("/api/forum/threads/:id/replies", async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM forum_replies WHERE thread_id = ? ORDER BY created_at ASC"
  ).bind(id).all();

  return c.json(results);
});

app.post("/api/forum/threads/:id/replies", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ user_name: string; content: string }>();

  if (!body.user_name?.trim() || !body.content?.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO forum_replies (thread_id, user_name, content)
     VALUES (?, ?, ?)`
  )
    .bind(id, body.user_name.trim(), body.content.trim())
    .run();

  await c.env.DB.prepare(
    "UPDATE forum_threads SET replies = COALESCE(replies, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(id)
    .run();

  const reply = await c.env.DB.prepare("SELECT * FROM forum_replies WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json({ success: true, reply }, 201);
});

app.post("/api/forum/replies/:id/like", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE forum_replies SET likes = COALESCE(likes, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  const reply = await c.env.DB.prepare("SELECT * FROM forum_replies WHERE id = ?").bind(id).first();
  return c.json({ success: true, reply }, 200);
});

// Album kegiatan endpoints
app.get("/api/albums", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  const shouldIncludeExpired = code === adminCode;

  const query = shouldIncludeExpired
    ? "SELECT * FROM albums ORDER BY created_at DESC"
    : "SELECT * FROM albums WHERE expires_at IS NULL OR datetime(expires_at) > datetime('now') ORDER BY created_at DESC";

  const { results } = await c.env.DB.prepare(query).all();

  return c.json(results.map(mapAlbumRow));
});

app.post("/api/albums", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();

  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const body = await c.req.json<{
    title: string;
    date: string;
    location: string;
    description: string;
    photos?: string[];
    videos?: string[];
    visibility_days?: number | null;
  }>();

  if (!body.title?.trim() || !body.date?.trim() || !body.location?.trim() || !body.description?.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const photos = JSON.stringify(parseStoredList(body.photos));
  const videos = JSON.stringify(parseStoredList(body.videos));
  const visibilityDays = parseVisibilityDays(body.visibility_days);
  const expiresAt = computeExpiresAtIso(visibilityDays);

  const result = await c.env.DB.prepare(
    `INSERT INTO albums (title, date, location, description, photos_json, videos_json, visibility_days, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(body.title.trim(), body.date.trim(), body.location.trim(), body.description.trim(), photos, videos, visibilityDays, expiresAt)
    .run();

  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json({ success: true, album: mapAlbumRow(album) }, 201);
});

app.patch("/api/albums/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();

  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  const body = await c.req.json<{
    title: string;
    date: string;
    location: string;
    description: string;
    photos?: string[];
    videos?: string[];
    visibility_days?: number | null;
  }>();

  if (!body.title?.trim() || !body.date?.trim() || !body.location?.trim() || !body.description?.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const visibilityDays = parseVisibilityDays(body.visibility_days);
  const expiresAt = computeExpiresAtIso(visibilityDays);

  await c.env.DB.prepare(
    `UPDATE albums
     SET title = ?, date = ?, location = ?, description = ?, photos_json = ?, videos_json = ?, visibility_days = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      body.title.trim(),
      body.date.trim(),
      body.location.trim(),
      body.description.trim(),
      JSON.stringify(parseStoredList(body.photos)),
      JSON.stringify(parseStoredList(body.videos)),
      visibilityDays,
      expiresAt,
      id
    )
    .run();

  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?").bind(id).first();
  return c.json({ success: true, album: mapAlbumRow(album) }, 200);
});

app.delete("/api/albums/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();

  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM album_comments WHERE album_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM albums WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.post("/api/albums/:id/like", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE albums SET likes = COALESCE(likes, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?").bind(id).first();
  return c.json({ success: true, album: mapAlbumRow(album) }, 200);
});

app.post("/api/albums/:id/share", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE albums SET shares = COALESCE(shares, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  const album = await c.env.DB.prepare("SELECT * FROM albums WHERE id = ?").bind(id).first();
  return c.json({ success: true, album: mapAlbumRow(album) }, 200);
});

app.get("/api/albums/:id/comments", async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM album_comments WHERE album_id = ? ORDER BY created_at ASC"
  ).bind(id).all();

  return c.json(results);
});

app.post("/api/albums/:id/comments", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ user_name: string; message: string }>();

  if (!body.user_name?.trim() || !body.message?.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO album_comments (album_id, user_name, message)
     VALUES (?, ?, ?)`
  )
    .bind(id, body.user_name.trim(), body.message.trim())
    .run();

  await c.env.DB.prepare(
    "UPDATE albums SET comments_count = COALESCE(comments_count, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(id)
    .run();

  const comment = await c.env.DB.prepare("SELECT * FROM album_comments WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json({ success: true, comment }, 201);
});

app.post("/api/albums/comments/:id/like", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("UPDATE album_comments SET likes = COALESCE(likes, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  const comment = await c.env.DB.prepare("SELECT * FROM album_comments WHERE id = ?").bind(id).first();
  return c.json({ success: true, comment }, 200);
});

// Bullying reports endpoints
app.post("/api/bullying-reports", async (c) => {
  const body = await c.req.json<{
    report_category?: string;
    reporter_name: string;
    incident_description: string;
    incident_date?: string;
    incident_location?: string;
    evidence_files?: Array<{ name: string; type: string; data: string }>;
  }>();

  if (!body.reporter_name.trim() || !body.incident_description.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const evidenceFiles = Array.isArray(body.evidence_files) ? body.evidence_files.slice(0, 6) : [];
  const reportCategory = normalizeReportCategory(body.report_category);
  const evidencePayload = JSON.stringify(
    evidenceFiles
      .filter((file) => typeof file?.name === "string" && typeof file?.data === "string")
      .map((file) => ({
        name: file.name,
        type: file.type || "application/octet-stream",
        data: file.data,
      }))
  );

  let result;

  try {
    result = await c.env.DB.prepare(
      `INSERT INTO bullying_reports (reporter_name, incident_description, incident_date, incident_location, evidence_files, report_category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.reporter_name,
        body.incident_description,
        body.incident_date || new Date().toISOString(),
        body.incident_location || "",
        evidencePayload,
        reportCategory,
        "baru"
      )
      .run();
  } catch {
    // Backward compatibility for databases that have not applied new report columns yet.
    result = await c.env.DB.prepare(
      `INSERT INTO bullying_reports (reporter_name, incident_description, incident_date, incident_location, status)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(
        body.reporter_name,
        body.incident_description,
        body.incident_date || new Date().toISOString(),
        body.incident_location || "",
        "baru"
      )
      .run();
  }

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

app.get("/api/bullying-reports", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bullying_reports ORDER BY created_at DESC"
  ).all();

  const normalized = (results || []).map((report: any) => {
    let parsedEvidenceFiles: Array<{ name: string; type: string; data: string }> = [];

    if (typeof report?.evidence_files === "string" && report.evidence_files.trim().length > 0) {
      try {
        const parsed = JSON.parse(report.evidence_files);
        if (Array.isArray(parsed)) {
          parsedEvidenceFiles = parsed.filter((file) => typeof file?.name === "string" && typeof file?.data === "string");
        }
      } catch {
        parsedEvidenceFiles = [];
      }
    }

    return {
      ...report,
      report_category: normalizeReportCategory(report?.report_category || report?.category),
      evidence_files: parsedEvidenceFiles,
    };
  });

  return c.json(normalized);
});

app.delete("/api/bullying-reports/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();

  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM bullying_reports WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// Update bullying report status (admin only)
app.patch("/api/bullying-reports/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  const body = await c.req.json<{ status: string }>();
  
  await c.env.DB.prepare("UPDATE bullying_reports SET status = ? WHERE id = ?")
    .bind(body.status, id)
    .run();
  
  return c.json({ success: true });
});

// Analytics endpoints (admin only)
app.get("/api/admin/stats", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || DEFAULT_ADMIN_CODE;
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const [apprCount, ideasCount, forumCount, reportsCount] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM appreciations").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM ideas").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM forum_threads").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM bullying_reports").first(),
  ]);

  return c.json({
    appreciations: (apprCount as any).count,
    ideas: (ideasCount as any).count,
    forumThreads: (forumCount as any).count,
    bullyingReports: (reportsCount as any).count,
  });
});

export default app;

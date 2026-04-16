import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cors } from "hono/cors";

interface Env {
  DB: any;
  ADMIN_ACCESS_CODE?: string;
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

// Mock OAuth endpoints (for compatibility)
app.get("/api/oauth/google/redirect_url", async (c) => {
  return c.json({ redirectUrl: "#" }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  // Mock session token
  const sessionToken = "mock-session-token";

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
  // Mock user
  return c.json({
    id: "mock-user",
    email: "user@example.com",
    name: "Mock User"
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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

  if (!body.to_name.trim() || !body.from_user_name.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO appreciations (from_user_id, from_user_name, to_name, type, message, is_anonymous)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      "guest",
      body.is_anonymous ? "Anonim" : body.from_user_name,
      body.to_name,
      body.type,
      body.message || "",
      body.is_anonymous ? 1 : 0
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM forum_threads WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Bullying reports endpoints
app.post("/api/bullying-reports", async (c) => {
  const body = await c.req.json<{
    reporter_name: string;
    incident_description: string;
    incident_date?: string;
    incident_location?: string;
  }>();

  if (!body.reporter_name.trim() || !body.incident_description.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
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

  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

app.get("/api/bullying-reports", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
  const code = (c.req.query("admin_code") || c.req.header("X-Admin-Code") || "").toString().trim();
  
  if (code !== adminCode) {
    return c.json({ error: "Invalid admin code" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bullying_reports ORDER BY created_at DESC"
  ).all();

  return c.json(results);
});

app.delete("/api/bullying-reports/:id", async (c) => {
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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
  const adminCode = c.env.ADMIN_ACCESS_CODE?.trim() || "OSIS2026";
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

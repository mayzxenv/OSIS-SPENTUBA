import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function normalizeBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const normalized = new URL(withProtocol);
    normalized.pathname = "";
    normalized.search = "";
    normalized.hash = "";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

const baseUrl = normalizeBaseUrl(
  process.env.SEO_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://sispentuba.web.id"
);

if (!baseUrl) {
  console.warn("[seo] Skipped: base URL could not be resolved.");
  process.exit(0);
}

const routes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/album-kegiatan", changefreq: "weekly", priority: "0.9" },
  { path: "/struktur-organisasi", changefreq: "weekly", priority: "0.9" },
  { path: "/apresiasi", changefreq: "weekly", priority: "0.8" },
  { path: "/bank-ide", changefreq: "weekly", priority: "0.8" },
  { path: "/forum", changefreq: "daily", priority: "0.8" },
  { path: "/panduan", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/privasi", changefreq: "yearly", priority: "0.3" },
  { path: "/syarat", changefreq: "yearly", priority: "0.3" },
  { path: "/kontak", changefreq: "yearly", priority: "0.6" },
];

const publicDir = resolve(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });

const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map(
    ({ path, changefreq, priority }) =>
      `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join("\n")}\n</urlset>\n`;

writeFileSync(resolve(publicDir, "robots.txt"), robotsTxt, "utf8");
writeFileSync(resolve(publicDir, "sitemap.xml"), sitemapXml, "utf8");

console.log(`[seo] Generated robots.txt and sitemap.xml for ${baseUrl}`);

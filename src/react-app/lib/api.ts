const RUNTIME_API_BASE_URL_KEY = "osis_api_base_url";
// Keep default empty so the frontend uses relative `/api/...` paths by default.
// This prevents unintentional cross-browser/backend mismatches when
// `VITE_API_BASE_URL` is not set in the environment.
const DEFAULT_API_BASE_URL = "";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function getRuntimeApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const params = new URLSearchParams(window.location.search);
  const queryBaseUrl = (params.get("api_base_url") || "").trim();

  // Support one-time debug override via query param only. Deliberately ignore
  // any values persisted in sessionStorage/localStorage to prevent per-browser
  // divergence — clients should use the environment `VITE_API_BASE_URL` when
  // a non-relative API host is required for all users.
  if (queryBaseUrl) {
    // eslint-disable-next-line no-console
    console.warn('[osis] api_base_url override detected in query string — using for this load only.');
    return queryBaseUrl;
  }

  return "";
}

const apiBaseUrl = normalizeBaseUrl(
  (import.meta.env.VITE_API_BASE_URL || "").trim() || getRuntimeApiBaseUrl() || DEFAULT_API_BASE_URL
);

// Expose runtime value for quick debugging in the browser console.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.__osis_api_base_url = apiBaseUrl;
  // eslint-disable-next-line no-console
  console.info(`[osis] apiBaseUrl=${apiBaseUrl || '(relative)'}`);
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

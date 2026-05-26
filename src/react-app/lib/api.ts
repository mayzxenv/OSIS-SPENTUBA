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
  if (queryBaseUrl) {
    // Allow a temporary override via query param but do NOT persist it to storage
    // to avoid cross-browser/local-cache confusion. Use this for one-time debugging.
    // The code previously persisted this value which caused different browsers
    // to talk to different API backends unexpectedly.
    // eslint-disable-next-line no-console
    console.warn('[osis] api_base_url override detected in query string — using for this load only.');
    return queryBaseUrl;
  }

  const runtimeValue = (sessionStorage.getItem(RUNTIME_API_BASE_URL_KEY) || "").trim();
  const legacyValue = (localStorage.getItem(RUNTIME_API_BASE_URL_KEY) || "").trim();

  // Prefer explicit runtime/session override when present; keep legacy localStorage
  // for backward compatibility but do not auto-migrate values.
  return runtimeValue || legacyValue || "";
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

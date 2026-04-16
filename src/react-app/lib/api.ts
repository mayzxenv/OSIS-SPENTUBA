const RUNTIME_API_BASE_URL_KEY = "osis_api_base_url";
const DEFAULT_API_BASE_URL = "https://019bd78e-c6c9-70be-99f0-e319b1d30389.osis-spentuba.workers.dev";

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
    localStorage.setItem(RUNTIME_API_BASE_URL_KEY, queryBaseUrl);
    return queryBaseUrl;
  }

  return (localStorage.getItem(RUNTIME_API_BASE_URL_KEY) || "").trim();
}

const apiBaseUrl = normalizeBaseUrl(
  (import.meta.env.VITE_API_BASE_URL || "").trim() || getRuntimeApiBaseUrl() || DEFAULT_API_BASE_URL
);

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

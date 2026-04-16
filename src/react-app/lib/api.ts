const RUNTIME_API_BASE_URL_KEY = "osis_api_base_url";

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
  (import.meta.env.VITE_API_BASE_URL || "").trim() || getRuntimeApiBaseUrl()
);

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

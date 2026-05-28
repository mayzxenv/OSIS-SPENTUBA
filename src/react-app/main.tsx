import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

const APP_STORAGE_VERSION = '2026-05-28-2';
const APP_STORAGE_VERSION_KEY = 'osis_app_storage_version';
const STALE_STORAGE_KEYS = [
  'osis_albums',
  'osis_albums_timestamp',
  'osis_albums_migrated',
  'osis_albums_legacy_backup',
  'osis_api_base_url',
];

function clearStaleAppStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storedVersion = localStorage.getItem(APP_STORAGE_VERSION_KEY);
    if (storedVersion === APP_STORAGE_VERSION) {
      return;
    }

    STALE_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    localStorage.setItem(APP_STORAGE_VERSION_KEY, APP_STORAGE_VERSION);
    // eslint-disable-next-line no-console
    console.info(`[osis] Cleared stale browser storage for app version ${APP_STORAGE_VERSION}.`);
  } catch {
    // ignore storage access errors
  }
}

clearStaleAppStorage();

// If the app was built with an explicit VITE_API_BASE_URL, clear any client-side
// overrides so all clients use the same backend. This helps avoid a situation
// where one browser talks to a different API host because of leftover sessionStorage.
if (typeof window !== 'undefined' && (import.meta.env.VITE_API_BASE_URL || '').trim()) {
  try {
    const key = 'osis_api_base_url';
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
    // eslint-disable-next-line no-console
    console.info('[osis] Cleared local API overrides because VITE_API_BASE_URL is set.');
  } catch (e) {
    // ignore
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

const APP_STORAGE_VERSION = '2026-05-28-2';
const APP_STORAGE_VERSION_KEY = 'osis_app_storage_version';
const APP_AUTO_RESET_QUERY_KEY = 'osis-reset';
const STALE_STORAGE_KEYS = [
  'osis_albums',
  'osis_albums_timestamp',
  'osis_albums_migrated',
  'osis_albums_legacy_backup',
  'osis_api_base_url',
  'osis_device_repair_requested',
];

function clearStaleAppStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    STALE_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    localStorage.setItem(APP_STORAGE_VERSION_KEY, APP_STORAGE_VERSION);
    // eslint-disable-next-line no-console
    console.info(`[osis] Cleared app browser storage for version ${APP_STORAGE_VERSION}.`);
  } catch {
    // ignore storage access errors
  }

  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).catch(() => {
          // ignore cache deletion errors
        });
      });
    }).catch(() => {
      // ignore cache API errors
    });
  }
}

function restartWithCleanStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get(APP_AUTO_RESET_QUERY_KEY) === '1') {
    url.searchParams.delete(APP_AUTO_RESET_QUERY_KEY);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    return;
  }

  clearStaleAppStorage();

  url.searchParams.set(APP_AUTO_RESET_QUERY_KEY, '1');
  window.location.replace(`${url.pathname}${url.search}${url.hash}`);
}

restartWithCleanStorage();

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

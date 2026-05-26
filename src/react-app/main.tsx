import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

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

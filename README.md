## OSIS Connect

Portal interaktif OSIS - Pusat kegiatan, aspirasi, dan kolaborasi siswa.

To run the devserver:
```
npm install
npm run dev
```

To deploy to Vercel:
```
npm install
npm run build
vercel deploy --prod
```

Set this environment variable in Vercel so frontend can reach the API backend:
```
VITE_API_BASE_URL=https://YOUR-CLOUDFLARE-WORKER-URL
```

The project includes `vercel.json` to run the build and route SPA requests to `index.html`.

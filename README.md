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

The project includes `vercel.json` to build with `@vercel/static-build` and route SPA requests to `index.html`.

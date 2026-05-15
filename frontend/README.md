# DriveShare Frontend

A React 18 + Vite frontend for the vehicle rental platform.

## Tech Stack

| Layer | Library |
| --- | --- |
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| HTTP | Axios |
| Forms | React Hook Form |
| Notifications | React Hot Toast |
| Maps | Leaflet + OpenStreetMap |

## Quick Start

```bash
npm install
cp .env.example .env

# backend should be running on http://localhost:5000
npm run dev
```

The Vite proxy forwards `/api` to `http://localhost:5000` during local development.

## Production Build

```bash
npm run build
```

The `dist/` folder can be deployed to Vercel, Netlify, or any static host.

## Vercel + Render Deployment

1. Deploy the backend to Render using the repo root [render.yaml](../render.yaml).
2. Replace `https://replace-with-your-render-backend.onrender.com` in [vercel.json](./vercel.json) with your real Render backend URL.
3. Leave `VITE_API_BASE_URL` unset in Vercel so the frontend keeps calling `/api/v1` and lets the Vercel rewrite proxy handle requests.
4. If you ever call the backend directly instead of through the proxy, set the backend `CORS_ORIGIN` to your Vercel frontend domain.

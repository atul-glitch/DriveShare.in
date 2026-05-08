# DriveShare — React Frontend

A dark-themed, modern vehicle rental frontend built with React 18, Vite, and Tailwind CSS.

## Tech Stack

| Layer        | Library                       |
|-------------|-------------------------------|
| Framework   | React 18 + Vite               |
| Routing     | React Router v6               |
| Styling     | Tailwind CSS v3               |
| HTTP        | Axios (with auto token refresh)|
| Forms       | React Hook Form               |
| Toasts      | React Hot Toast               |
| Icons       | Lucide React                  |
| Maps        | Leaflet + OpenStreetMap       |
| Dates       | date-fns                      |
| Fonts       | Clash Display, Satoshi, JetBrains Mono |

## Project Structure

```
src/
├── main.jsx                  ← entry point
├── App.jsx                   ← routes
├── index.css                 ← design system / Tailwind layers
├── context/
│   └── AuthContext.jsx       ← global auth state
├── services/
│   └── api.js                ← Axios + all API calls
├── hooks/
│   └── index.js              ← useVehicles, useBooking, useDebounce, …
├── utils/
│   ├── helpers.js            ← formatINR, calculateFare, …
│   └── notify.js             ← toast wrapper
├── components/
│   ├── common/
│   │   ├── index.jsx         ← Spinner, StatusBadge, StarRating, EmptyState, …
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx        ← PublicLayout, DashboardLayout, AuthLayout
│   │   ├── Pagination.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── VehicleMap.jsx    ← Leaflet map
│   │   └── ImageGallery.jsx  ← lightbox gallery
│   ├── vehicle/
│   │   ├── VehicleCard.jsx
│   │   ├── VehicleFilters.jsx
│   │   └── ReviewForm.jsx
│   ├── booking/
│   │   └── BookingCard.jsx
│   └── message/
│       └── MessageThread.jsx ← real-time chat UI
└── pages/
    ├── Home.jsx
    ├── Login.jsx
    ├── Register.jsx          ← 4-step multi-form with KYC upload
    ├── Vehicles.jsx          ← browse + filter + pagination
    ├── VehicleDetail.jsx     ← gallery, specs, booking panel
    ├── Dashboard.jsx         ← stats + recent bookings
    ├── BookingDetail.jsx     ← tabs: details / messages / payment
    ├── MyVehicles.jsx        ← owner listing manager
    ├── Profile.jsx
    └── NotFound.jsx
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Start dev server (backend must be on :8000)
npm run dev
```

The Vite proxy forwards `/api` → `http://localhost:8000`, so no CORS issues in dev.

## Pages & Routes

| Route               | Auth | Description                  |
|--------------------|------|------------------------------|
| `/`                | ✗    | Landing page                 |
| `/vehicles`        | ✗    | Browse vehicles + filters    |
| `/vehicles/:id`    | ✗    | Detail + booking panel       |
| `/login`           | ✗    | Login form                   |
| `/register`        | ✗    | 4-step KYC registration      |
| `/dashboard`       | ✓    | Stats + recent bookings      |
| `/bookings`        | ✓    | Renter booking list          |
| `/bookings/:id`    | ✓    | Detail + messages + payment  |
| `/owner-bookings`  | ✓    | Owner booking management     |
| `/my-vehicles`     | ✓    | Owner vehicle listings       |
| `/vehicles/new`    | ✓    | List a new vehicle           |
| `/earnings`        | ✓    | Owner earnings dashboard     |
| `/profile`         | ✓    | User profile + password      |

## Build for Production

```bash
npm run build
# dist/ folder is ready to deploy (Vercel, Netlify, etc.)
```

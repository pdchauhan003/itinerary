# TripForge — AI-Powered Travel Itinerary

MERN web app: upload travel booking documents (PDF/images), extract booking details with AI, and generate a shareable day-by-day itinerary.

## Features

- **JWT authentication** — Register, login, refresh tokens (httpOnly cookies + Bearer header)
- **Document upload** — Flight tickets, hotel bookings, train passes (PDF, JPEG, PNG, WebP)
- **Data extraction** — PDF text parsing + Gemini vision for images
- **AI itinerary** — Structured day-by-day plan via Google Gemini
- **MongoDB storage** — Itinerary history per user
- **Sharing** — Public read-only links with copy & social share

## Tech stack

| Layer    | Stack                                      |
| -------- | ------------------------------------------ |
| Frontend | React 19, Vite, React Router, Axios        |
| Backend  | Node.js, Express 5, Mongoose               |
| Database | MongoDB                                    |
| Storage  | Cloudinary                                 |
| AI       | Google Gemini (`@google/generative-ai`)    |

## Project structure

```
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/      # AI + extraction
│       └── utils/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- [Cloudinary](https://cloudinary.com) account
- [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

### Environment variables

See `backend/.env.example`:

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| `MONGO_URI`      | MongoDB connection string      |
| `ACCESS_SECRET`  | JWT access secret (32+ chars)  |
| `REFRESH_SECRET` | JWT refresh secret             |
| `CLOUDINARY_*`   | Cloudinary credentials         |
| `GEMINI_API_KEY` | Google Gemini API key          |
| `CLIENT_URL`     | Frontend URL for share links   |

## API overview

| Method | Endpoint                      | Auth | Description              |
| ------ | ----------------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register`          | —    | Register user            |
| POST   | `/api/auth/login`             | —    | Login                    |
| GET    | `/api/auth/me`                | ✓    | Current user             |
| POST   | `/api/itineraries`            | ✓    | Upload docs + generate   |
| GET    | `/api/itineraries`            | ✓    | List user itineraries    |
| GET    | `/api/itineraries/:id`        | ✓    | Get itinerary            |
| POST   | `/api/itineraries/:id/share`  | ✓    | Enable public share link |
| GET    | `/api/itineraries/share/:id`  | —    | View shared itinerary    |

## Notes

- Without `GEMINI_API_KEY`, the app still runs with a basic fallback itinerary.
- Max 5 files per upload, 10MB each.
- Share links look like: `http://localhost:5173/share/{shareId}`

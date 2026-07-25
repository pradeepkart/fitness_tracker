# FitAI — AI Fitness Tracker

This workspace contains a full-stack demo AI Fitness Tracker (MERN-like) with an in-memory fallback for development.

Quick start (root):

1. Install dependencies for both client and server:

```bash
npm run install:client
npm run install:server
```

2. Start both dev servers (runs Vite and Nodemon):

```bash
npm run dev
```

3. Open the app in the browser:

 - Client (Vite): http://localhost:5173 or 5174 (Vite chooses a free port)
 - API server: http://localhost:5000

Development utilities

- `GET /api/dev/seed?email=demo@local` — seed a demo user and return a token.
- `GET /api/dev/clear` — clear demo in-memory data (useful to reset demo state).

Notes

- The server supports an in-memory fallback so you can run the app without MongoDB. To enable MongoDB, set `MONGODB_URI` in `server/.env` and restart the server.
- Set `JWT_SECRET` in environment for production.

Build & production

 - Client build: `npm --prefix client run build`
 - Server start (production): `npm --prefix server run start`

If you'd like, I can:
 - Connect the app to MongoDB Atlas (I will add instructions and code changes),
 - Add Cloudinary image uploads for profile pictures,
 - Replace alerts with a toast system and polish UX.

Enjoy — tell me which final polish step you'd like next.
# AI Fitness Tracker

A polished MERN fitness tracker with authentication, dashboard analytics, workout and meal management, AI-generated plans, and profile settings. The app is structured for Vercel deployment and portfolio use.

## Features
- JWT authentication with protected routes
- Responsive dashboard with charts and stats
- Workout tracker, nutrition tracker, goals, AI studio, and profile page
- MongoDB persistence and Cloudinary-ready profile image flow
- Vercel-compatible client and serverless API setup

## Project structure
- client/: React + Vite + Tailwind frontend
- server/: Express + MongoDB backend
- api/: Vercel serverless entry

## Local setup
1. Install dependencies:
   - npm install
   - npm run install:client
   - npm run install:server
2. Create environment files:
   - server/.env from server/.env.example
   - client/.env from client/.env.example
3. Start the app:
   - npm run dev

## Build
- npm run build

## API endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/workouts
- POST /api/workouts
- PUT /api/workouts/:id
- DELETE /api/workouts/:id
- GET /api/meals
- POST /api/meals
- DELETE /api/meals/:id
- GET /api/goals
- PUT /api/goals
- GET /api/water
- POST /api/water
- POST /api/ai/generate
- GET /api/dashboard/summary

## Deployment guide
1. Create a Vercel project and link the repository.
2. Set environment variables in Vercel for the server and client.
3. Build command: npm run build
4. Output directory: client/dist
5. For API routes, use the Vercel serverless entry in api/index.js.

## Environment variables
### Server
- MONGODB_URI
- JWT_SECRET
- OPENAI_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- PORT

### Client
- VITE_API_URL

## MongoDB Atlas setup
1. Create a free Atlas cluster.
2. Create a database user.
3. Whitelist 0.0.0.0/0 for development or add your IP for production.
4. Copy the connection string to MONGODB_URI.

## Testing instructions
- Start the server and client locally.
- Register a user and verify protected routes.
- Use the dashboard and tracking pages.

## Future improvements
- Add real Cloudinary uploads
- Integrate real OpenAI responses with fallback prompts
- Add PDF export and advanced charting
- Add notification system and email reminders

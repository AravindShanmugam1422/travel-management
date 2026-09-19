# Travel Management - SvelteKit + Aiven MySQL + Vercel

Full-stack version: SvelteKit frontend/API + Aiven MySQL database, ready to deploy on Vercel.

## 1. Create the database tables

1. Open **HeidiSQL**, connect to your Aiven MySQL service (host/port/user/password from the Aiven console → your service → Connection information).
2. Open a new Query tab on your database, paste the contents of `schema.sql` (in this folder), and run it (F9 / the Run button).
3. This creates all tables and seeds the same demo data you saw in the preview, including one Head Office login:
   - username: `aravind`
   - password: `admin123`


## 2. Configure your database connection

```
cp .env.example .env
```
Edit `.env` and fill in your Aiven MySQL host, port, user, password, database name (same values you used in HeidiSQL).

## 3. Run it locally

```
npm install
npm run dev
```
Open the printed local URL. Login with `aravind` / `admin123` (Head Office role) to confirm it's reading/writing to your Aiven database.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo (or use the Vercel CLI: `npx vercel`).
2. Import the repo in Vercel (vercel.com → Add New → Project).
3. Vercel auto-detects SvelteKit (`@sveltejs/adapter-vercel` is already set up).
4. In the Vercel project's **Settings → Environment Variables**, add the same 5 variables from your `.env`:
   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
5. Deploy. Your app will be live at `your-project.vercel.app`, reading/writing the same Aiven database.

## What changed from the earlier localStorage version
- All 9 tabs' data now lives in MySQL (Aiven), not the browser.
- `src/routes/api/**` are SvelteKit server routes (`+server.js`) - this is your backend, running as Vercel serverless functions.
- `src/lib/server/db.js` opens the MySQL connection pool (server-only, credentials never reach the browser).
- `src/lib/server/auth.js` hashes/verifies passwords with Node's built-in `crypto.scrypt` (no extra password library needed).
- `src/lib/api.js` is the frontend's fetch helper that talks to `/api/*`.
- `src/lib/data.js` and `src/lib/stores.js` now hold live data fetched from the API instead of localStorage.
- Login/Signup, Add Agent, and every Add/Edit/Delete button across Clients, Trips, Suppliers, Bookings, Payments, Expenses, Itinerary and Service Review now call the API and persist to your database.

## Known limitation (worth fixing before real production use)
There's no session/auth token yet - the logged-in user's role is trusted from the browser (stored in localStorage) rather than verified per-request on the server. For a real deployment, add a signed session cookie or JWT issued at login, and check the caller's role server-side in `src/routes/api/agents/+server.js` and anywhere else that should be role-restricted. Fine for a demo/internal tool; not fine once this is public-facing.

## Project structure
```
schema.sql              run this once in HeidiSQL against your Aiven DB
.env.example             copy to .env and fill in DB credentials
src/
  lib/
    server/               DB pool, password hashing, generic CRUD (server-only, never bundled to browser)
    views/                one .svelte file per tab (Login, Dashboard, Clients, Trips, ...)
    api.js                frontend fetch helper
    data.js, stores.js    Svelte stores backed by the API
    Sidebar.svelte, Topbar.svelte, Modal.svelte, Donut.svelte, StatCard.svelte
  routes/
    +page.svelte          the app shell (login gate + tab router)
    api/**/+server.js     REST endpoints, one folder per resource
```

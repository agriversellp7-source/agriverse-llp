# AgriVerse LLP website

Vite + React + TypeScript + Supabase.

## Setup
1. Create a Supabase project, run `supabase/schema.sql` in the SQL Editor.
2. Authentication -> Users -> add the client's admin user, then run the last (commented) line of schema.sql to whitelist them.
3. Open `.env.local` (copy of `.env.example`) and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`.
4. Put the hero video at `public/videos/hero.mp4`.
5. Replace phone / email / address in `Footer.tsx` and `ContactUs.tsx`.
6. `npm run dev` — site at `/`, admin at `/ad/login`.

## Deploying on Vercel (free plan)
1. Import the GitHub repo. Framework preset: **Vite** (build `npm run build`, output `dist`).
2. Project Settings -> Environment Variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RECAPTCHA_SITE_KEY` (optional)
   - `SITE_URL` (optional, e.g. `https://your-domain.com`, used in sitemap.xml)
3. The build no longer fails without these, but the site needs them to show products/enquiries.
4. When replacing photos/videos in `public/images` or `public/videos`, **use a new file name** (they are cached for 7 days in visitors' browsers).
5. `vercel.json` also runs a daily keep-alive ping so the free Supabase project is not paused.

## Keeping Supabase awake
- `.github/workflows/supabase-keepalive.yml` pings the database every 3 days. Add the repo secrets
  `SUPABASE_URL` and `SUPABASE_ANON_KEY` (GitHub -> Settings -> Secrets and variables -> Actions),
  then test it once from the Actions tab -> "Supabase keep-alive" -> Run workflow.
- Vercel also pings once a day via `/api/keepalive` (see `vercel.json`). Either one alone is enough.

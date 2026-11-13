# AgriVerse LLP website

Vite + React + TypeScript + Supabase (based on the Petricor codebase).

## Setup
1. Create a Supabase project, run `supabase/schema.sql` in the SQL Editor.
2. Authentication -> Users -> add the client's admin user, then run the last (commented) line of schema.sql to whitelist them.
3. Create `.env.local`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_RECAPTCHA_SITE_KEY=   # optional
   ```
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

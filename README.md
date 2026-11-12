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

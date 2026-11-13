# Supabase setup (database, admin login, e-mail alerts)

## 1. Create the database
1. Create a free project at supabase.com.
2. Dashboard -> **SQL Editor** -> New query -> paste all of `supabase/schema.sql` -> **Run**.
   (Safe to run again later.)

## 2. Create the admin login
1. Dashboard -> **Authentication -> Users -> Add user -> Create new user**.
   Enter the client's e-mail + a strong password, tick **Auto Confirm User**.
2. SQL Editor, run (change the e-mail):
   ```sql
   insert into admin_whitelist (user_id)
   select id from auth.users where email = 'ADMIN_EMAIL_HERE'
   on conflict do nothing;

   insert into settings (admin_email) values ('ADMIN_EMAIL_HERE');   -- where enquiry e-mails go
   ```
3. Login page of the site: `/ad/login`.
4. Authentication -> Providers -> Email: turn **off** "Allow new users to sign up" so nobody else can register.

## 3. Connect the website
Project Settings -> **API**: copy *Project URL* and the *anon public* key into
- local file `.env.local`, and
- Vercel -> Project -> Settings -> Environment Variables:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
(Never put the `service_role` key in the website.)

## 4. E-mail alerts for new enquiries (Gmail SMTP)

### 4a. Make a Google App Password
Normal Gmail passwords do not work here; you need an *App Password*.
1. Sign in to the Gmail account that will SEND the mails (best: a dedicated one, e.g. `agriverse.alerts@gmail.com`).
2. Google Account -> **Security** -> turn on **2-Step Verification** (required).
3. Open https://myaccount.google.com/apppasswords (or search "App passwords" in the account page).
4. App name: `Website` -> **Create** -> copy the 16-letter password (spaces don't matter).
   If the App passwords page is missing: 2-Step Verification is off, the account is a managed Workspace account with it disabled, or Advanced Protection is on.

### 4b. Store the secrets in Supabase
Dashboard -> **Edge Functions -> Secrets** (or CLI `npx supabase secrets set NAME=value`):

| Name | Value |
|---|---|
| `GMAIL_ADDRESS` | the sending Gmail address |
| `GMAIL_PASSWORD` | the 16-letter app password |
| `WEBHOOK_SECRET` | any long random text, e.g. output of `openssl rand -hex 24` |

(The recipient is NOT here: it is the e-mail saved in **Admin -> Settings**. If empty, mails go to the sending address.)

### 4c. Deploy the function `send-enquiry-email`
CLI (run in the project folder):
```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF     # the ref is in your Supabase URL
npx supabase functions deploy send-enquiry-email
```
No CLI? Dashboard -> Edge Functions -> **Deploy a new function -> Via Editor**, name it
`send-enquiry-email`, paste the contents of `supabase/functions/send-enquiry-email/index.ts`, Deploy.

### 4d. Trigger it on every new enquiry
Option 1 (dashboard): **Database -> Webhooks -> Create a new hook**
- Table: `enquiries`, Events: **Insert**
- Type: **Supabase Edge Functions**, Function: `send-enquiry-email`
- HTTP Headers: add `x-webhook-secret` = the same value as `WEBHOOK_SECRET`.

Option 2 (SQL): use the commented block at the bottom of `schema.sql`.

### 4e. Test
Send a message from the Contact page. Within seconds you should get an e-mail (check Spam the first time;
press **Reply** to answer the customer directly).
Debug: Dashboard -> Edge Functions -> `send-enquiry-email` -> **Logs**.

| Log message | Meaning |
|---|---|
| `Invalid login` / `535` | wrong app password, or 2-Step Verification is off |
| `GMAIL_ADDRESS or GMAIL_PASSWORD is not set` | secrets missing (step 4b) |
| HTTP 401 `Unauthorized` | `x-webhook-secret` header differs from `WEBHOOK_SECRET` |
| nothing in logs | webhook/trigger not created (step 4d) |

Limits: a normal Gmail account can send about 500 mails/day - far more than needed. The enquiry is always saved in the
Admin panel even if the e-mail fails.

## 5. Optional: reCAPTCHA
Not needed to launch. If spam appears: create a reCAPTCHA v3 key, set `VITE_RECAPTCHA_SITE_KEY` in Vercel and the
secret `RECAPTCHA_SECRET_KEY` in Supabase, then deploy `verify-recaptcha` the same way as above.

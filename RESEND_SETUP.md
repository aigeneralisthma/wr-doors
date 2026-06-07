# Resend Setup Guide — WR Doors × DODA

> One-time walkthrough to provision Resend for transactional email. Estimated time: **5 minutes**.

---

## What we're setting up

| Component | What it does |
|-----------|--------------|
| **Resend account** | Transactional email service. Free tier: 100 emails/day, 3,000/month |
| **API key** | Authenticates our server actions when sending email |
| **Sandbox sender** | `onboarding@resend.dev` — works instantly, no DNS setup |

---

## Step 1 — Create Resend account (~2 min)

1. Go to **[resend.com](https://resend.com)** → click **"Get Started for Free"**
2. **CRITICAL**: Sign up using **`aigeneralist.hma@gmail.com`** (your admin email).
   - Resend's free/sandbox tier only delivers email to **the account-owner's email address**.
   - If you sign up with a different email, the admin alerts will not deliver.
   - GitHub login is also fine — but it must use the same `aigeneralist.hma@gmail.com` address.
3. Verify your email if asked

> 💡 **What about customer emails?** With sandbox, customer confirmation emails will *not* deliver (their addresses aren't verified). The lead is still saved in Supabase and the customer sees the on-screen success state. When the client confirms their `wrdoors.com` domain (Prompt 10 or pre-launch), we add DNS records to deliver customer email globally — no code changes needed.

---

## Step 2 — Create API key (~1 min)

1. Resend Dashboard → **API Keys** (sidebar) → **Create API Key**
2. Fill in:
   - **Name**: `wr-doors-dev`
   - **Permission**: **Full access** (or **Send only** — both work for us)
   - **Domain**: leave on default
3. Click **Add** → **copy the `re_...` key NOW**
   - ⚠️ Resend only shows the full key once. Paste it somewhere safe.

---

## Step 3 — Update `.env.local` (~1 min)

Open `C:\doda-website\wr-doors\.env.local` and ensure these three lines are present and filled:

```env
# ----- Resend (transactional email) -----
RESEND_API_KEY="re_paste_your_key_here"
RESEND_FROM_EMAIL="WR Doors <onboarding@resend.dev>"
ADMIN_NOTIFICATION_EMAIL="aigeneralist.hma@gmail.com"
```

> 💡 The `RESEND_FROM_EMAIL` format is `Display Name <email@address>`. Most email clients render the display name in the inbox.

---

## Step 4 — Verify (after Claude wires the server actions)

Once the server actions are in place (Claude will tell you when), run:

```bash
cd C:\doda-website\wr-doors
pnpm dev
```

Open `http://localhost:3000/en/contact` → fill the form → submit. Expect:

- ✅ On-screen: success state appears ("Message received!")
- ✅ Supabase Dashboard → Table Editor → `leads` → 1 new row with `source='contact'`, `locale='en'`
- ✅ `aigeneralist.hma@gmail.com` inbox → admin alert email arrived (subject `[Lead] contact from <name>`)
- ❌ `<the email you typed in the form>` inbox → **nothing** (sandbox limitation — expected)

---

## What now?

The email infrastructure is wired. The site will:
- Save every form submission to Supabase ✅
- Notify the admin in real time ✅
- Show customers a polished success state with WhatsApp CTA ✅
- (Once `wrdoors.com` DNS is verified) Send branded confirmation emails to customers in their language

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `RESEND_API_KEY is not set` thrown in server logs | `.env.local` not updated, or `pnpm dev` was running when you saved | Restart `pnpm dev` after editing `.env.local` |
| Admin alert not arriving in inbox | Resend account signed up with different email than `ADMIN_NOTIFICATION_EMAIL` | Either change Resend account email, or check the email you actually signed up with |
| Form submits but no row in Supabase | Browser blocked the server action (rare) or Supabase env vars missing | Check browser console + ensure `NEXT_PUBLIC_SUPABASE_URL` + anon key are set |
| `Validation: 422` from Resend | Sender address malformed | Check `RESEND_FROM_EMAIL` follows `"Name <email@domain>"` format |

---

## Reference files

- Email infrastructure: `lib/email/client.ts`, `lib/email/send.ts`
- Email templates: `emails/customer-*.tsx`, `emails/admin-*.tsx`
- Server actions: `app/actions/leads.ts`, `app/actions/bookings.ts`
- Rate limiter: `lib/rate-limit.ts`

## When you're ready for real customer emails (pre-launch)

1. Buy or confirm control of `wrdoors.com` (or your final domain)
2. Resend Dashboard → **Domains** → **Add Domain** → enter `wrdoors.com`
3. Copy the DNS records (3 records: SPF, DKIM, optional DMARC) and add them to your DNS provider
4. Wait for verification (~10 min to a few hours)
5. Update `.env.local`:
   ```env
   RESEND_FROM_EMAIL="WR Doors <noreply@wrdoors.com>"
   ```
6. Restart the dev server / redeploy. Customer emails now deliver globally.

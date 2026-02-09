# Hostinger Deployment Checklist

## Before You Push

### 1. Database (already set to MySQL)
The schema is configured for MySQL. Set `DATABASE_URL` in Hostinger.

### 2. Environment Variables (set in Hostinger panel)
- `DATABASE_URL` — MySQL connection from Hostinger (e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME`)
- `SESSION_SECRET` — Long random string (at least 32 chars) for session security

### 3. Files to Exclude When Pushing
- `node_modules/` — Will be installed on server
- `.env` — Never push; set in Hostinger
- `prisma/dev.db` — Local SQLite; production uses MySQL
- `.next/` — Build output; regenerated on server

---

## Hostinger Requirements

- **Node.js hosting** (VPS or Node.js plan — basic shared hosting won’t work)
- **MySQL database** — Create one in Hostinger’s panel

---

## Deploy Steps (on Hostinger)

```bash
npm install
npx prisma generate
npx prisma db push      # Creates tables in MySQL
npx prisma db seed      # Loads products, settings, admin
npm run build
npm start
```

Or in Hostinger Node.js app settings:
- **Build command**: `npm run build`
- **Start command**: `npm start`

---

## After Deploy

- **Menu (customers)**: `https://your-domain.com/ar`
- **Admin**: `https://your-domain.com/admin`
- **Default admin** (if you ran seed): `admin` / `admin123` — **change this immediately**
- Ensure `public/uploads` exists and is writable (755) for image uploads

---

## How to Change Admin Username & Password

1. Log in to the admin panel: `https://your-domain.com/admin`
2. Go to **الإعدادات** (Settings) — the first tab
3. Scroll to **حساب المسؤول** (Admin Account)
4. Enter your current password, new username (optional), and new password
5. Click **تحديث الحساب** (Update Account)

---

## Does My Hostinger Plan Support This Site?

Your app needs **Node.js** support. Hostinger plans that support Node.js:

| Plan | Node.js | Notes |
|------|---------|-------|
| **Business** (~$3–17/mo) | ✅ Yes (5 apps) | Web hosting with Node.js |
| **Cloud Startup** (~$7–26/mo) | ✅ Yes (10 apps) | Cloud hosting |
| **VPS** | ✅ Yes | Full control, you install Node.js |
| **Basic / Premium** (shared) | ❌ No | PHP only – **won't work** |

**To check your plan:**
1. Log in to [hPanel](https://hpanel.hostinger.com)
2. Go to **Websites** → select your site
3. Look for **Node.js** or **Web Apps** in the left menu
4. If you see **Node.js** or **Deploy Node.js app** — your plan supports it
5. If you only see PHP, cPanel, or File Manager — you need to upgrade to Business/Cloud or VPS

**If you have the $10/month plan:** That's likely **Business** or **Cloud** — both support Node.js. Check for the Node.js / Web Apps section in hPanel.

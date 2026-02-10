# Deploy لباب بيتك (libabbitak) to Vercel

## Quick Start

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import repo
3. Add `DATABASE_URL` and `SESSION_SECRET` in **Environment Variables**
4. Enable Remote MySQL "any host" in Hostinger
5. Click **Deploy**

---

## 1. Hostinger MySQL – Enable Remote Access

1. Log in to [hPanel](https://hpanel.hostinger.com)
2. Go to **Databases** → **MySQL Databases**
3. Find your database `u389308396_libabbitak_db`
4. Open **Remote MySQL** and enable **Access from any host** (so Vercel can connect)
5. Save the connection details: Host, User, Password, Database name

## 2. Create Vercel Project

1. Push your code to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your `libabbitak` repository
5. Before deploying, add Environment Variables (see below)

## 3. Add Blob Storage (for image uploads)

1. In your Vercel project, go to the **Storage** tab
2. Click **Connect Database** → **Create New** → **Blob**
3. Name it (e.g. "libabbitak-images") and create
4. `BLOB_READ_WRITE_TOKEN` is auto-added to env vars

Without this, admin image uploads will return 500.

## 4. Environment Variables (Vercel)

In **Project Settings** → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `mysql://u389308396_u1234_dbuser:YOUR_PASSWORD@srv1700.hstgr.io:3306/u389308396_libabbitak_db` | Production, Preview |
| `SESSION_SECRET` | Long random string (e.g. 32+ chars) | Production, Preview |
| `BLOB_READ_WRITE_TOKEN` | Auto-set when you add Blob storage (see above) | Production, Preview |

Generate a strong `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Deploy

1. Click **Deploy**
2. Vercel will run:
   - `prisma generate` (via postinstall)
   - `prisma db push` (creates/updates tables)
   - `prisma db seed` (loads products, settings, admin)
   - `next build`
3. If MySQL connection fails, double‑check Remote MySQL in Hostinger and `DATABASE_URL` in Vercel

## 6. After Deploy

- **Customer menu:** `https://your-app.vercel.app/ar`
- **Admin:** `https://your-app.vercel.app/admin`
- **Default login:** `admin` / `admin123` – change immediately in الإعدادات → حساب المسؤول

## Troubleshooting

| Error | Fix |
|-------|-----|
| Can't reach database server | Enable Remote MySQL “any host” in Hostinger |
| `prisma generate` failed | Check Prisma is in `dependencies` (not devDependencies) |
| Build timeout | Hostinger MySQL might be slow; try again or check DB host |
| Admin upload 500 | Add Blob storage in Vercel Storage tab |

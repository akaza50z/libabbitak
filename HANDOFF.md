# Client Handoff Guide – لباب بيتك

This document is for the client who will host the site on **Hostinger**. Complete these steps before handing off the project.

---

## 1. What to Deliver

**Package the project** for the client:

Zip the entire project folder **excluding**:
- `node_modules/` (client runs `npm install`)
- `.env` (client creates their own – never share secrets)
- `prisma/dev.db` (local SQLite – client uses MySQL in production)
- `.next/` (build output – client runs `npm run build`)

**Must be included:**
- All source code (`src/`, `prisma/`, `public/`, etc.)
- `prisma/data/all_products.json`
- `lbab_beytk_products_final.csv` (in project root or `prisma/data/`)
- `HANDOFF.md` and `README.md`
- `package.json`, `next.config.mjs`, `tailwind.config.ts`, etc.

---

## 2. Client’s Hostinger Setup (What They Need to Do)

### A. Hostinger Requirements

- **Node.js hosting** (Hostinger Node.js plan or VPS)
- **MySQL database** (included with most Hostinger plans)

### B. Environment Variables

The client creates a `.env` file in the project root with:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"
SESSION_SECRET="long-random-string-at-least-32-chars"
```

- `USER`, `PASSWORD`, `HOST`, `DATABASE_NAME` come from Hostinger → MySQL Databases.

### C. Schema Change for MySQL

For production, the app must use MySQL instead of SQLite. Edit `prisma/schema.prisma`:

Change:
```
provider = "sqlite"
```
to:
```
provider = "mysql"
```

(Update this before zipping if you want it ready for production, or include clear instructions for the client.)

### D. Build & Deploy Steps (Client Runs These)

```bash
npm install
npx prisma generate
npx prisma db push          # Creates tables in MySQL (no migrations needed for fresh DB)
npx prisma db seed          # Loads products, settings, admin user
npm run build
npm start
```

Or use Hostinger’s Node.js app panel and set:
- **Start command**: `npm start`
- **Build command**: `npm run build`

### E. Admin Access After First Deploy

- URL: `https://their-domain.com/admin`
- First-time setup: `/admin/setup` (if no admin exists)
- Or use seeded admin: **username** `admin`, **password** `admin123`  
  → Client should change the password in admin settings or via setup.

### F. Uploads Folder

Ensure `public/uploads` exists and is writable (755 or 775) so the admin can upload images.

---

## 3. Create the Zip (Your Step)

From the project folder, create the zip excluding sensitive/unnecessary files. **PowerShell**:

```powershell
# From parent of libabbitak folder
Compress-Archive -Path "libabbitak\*" -DestinationPath "libabbitak-handoff.zip" -CompressionLevel Optimal
# Then manually remove node_modules, .env, prisma/dev.db, .next from the zip if they were included,
# OR use a tool like 7-Zip to exclude those folders when creating the archive.
```

Or use **File Explorer**: right‑click the `libabbitak` folder → Send to → Compressed folder, then delete `node_modules`, `.env`, `prisma/dev.db`, and `.next` from the zip if present.

---

## 4. Your Checklist Before Handoff

- [ ] Favicon set (orange لباب بيتك logo)
- [ ] `.env` removed from the zip (or replaced with `.env.example` only)
- [ ] `node_modules` excluded from zip
- [ ] `prisma/schema.prisma` provider set to `mysql` for production (or clear instructions included)
- [ ] Client has Hostinger Node.js + MySQL access
- [ ] Client knows admin URL: `/admin` and login credentials

---

## 5. Optional: Update Products/Images Later

If the client needs to refresh product images or prices from CSV:

```bash
# Place lbab_beytk_products_final.csv in project root or prisma/data/
npx tsx prisma/update-from-csv.ts
```

---

## 6. QR Code

After deployment, the menu URL is:
```
https://their-domain.com/ar
```
Client can generate a QR code from this URL and use it in the restaurant.

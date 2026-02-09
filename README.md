# QR Menu + WhatsApp Checkout

A production-ready **QR Menu** web app for restaurants. Customers browse the menu, add items to cart, then checkout via WhatsApp or call the restaurant. No online payments. Mobile-first, Arabic RTL.

## Features

- **Public Menu** (`/ar`): Category tabs, search, item cards, cart, WhatsApp checkout, call button
- **Admin Panel** (`/admin`): Restaurant settings, categories CRUD, items CRUD, image upload
- **Auth**: Simple password login with bcrypt. First-run setup at `/admin/setup`
- **Cart**: Stored in localStorage, survives refresh
- **WhatsApp**: Pre-filled order message with items, totals, table/address, notes

## Tech Stack

- Next.js 14 App Router (TypeScript)
- Tailwind CSS
- Prisma ORM + SQLite (dev). MySQL-compatible schema for Hostinger
- Zod validation, bcrypt auth

## Quick Start

```bash
npm install
npx prisma migrate dev
npm run dev
```

- **Public menu**: http://localhost:3000/ar
- **Admin**: http://localhost:3000/admin (first time: use `/admin/setup`)

### Seed (optional)

Creates sample data + admin user (username: `admin`, password: `admin123`):

```bash
npm run db:seed
```

Or run after migrate:

```bash
npx prisma db seed
```

## Build

```bash
npm run build
npm start
```

## Hostinger Deployment

1. **Node.js hosting**: Use Hostinger Node.js plan.
2. **Environment variables** (in Hostinger panel):
   - `DATABASE_URL` – For SQLite: `file:./prisma/prod.db`. For MySQL: `mysql://user:pass@host/db`
   - `SESSION_SECRET` – Long random string for session cookies

3. **Database**:
   - SQLite: ensure `prisma` folder and `prod.db` are writable.
   - MySQL: run `npx prisma migrate deploy` after setting `DATABASE_URL`.

4. **Uploads**: Create `public/uploads` with write permissions (755 or 775).

5. **Build & start**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy   # if using migrations
   npm run build
   npm start
   ```

## Customize for a Restaurant

1. **First run**: Visit `/admin/setup` to create admin password.
2. **Settings**: Set restaurant name, phone, WhatsApp number, currency (IQD), logo, mode (dine-in/delivery).
3. **Categories**: Add menu sections (e.g. مقبلات، أطباق رئيسية).
4. **Items**: Add dishes with name, description, price, image (upload or URL).
5. **QR link**: Use your site URL (e.g. `https://yoursite.com/ar`) – generate a QR code from this URL.

## Create QR Link

- **URL**: `https://your-domain.com/ar`
- Use any free QR generator (e.g. qr-code-generator.com) with this URL.
- Print and place on tables or at the counter.

## Checklist

- [ ] Run `npm install`
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npm run db:seed` (optional)
- [ ] Visit `/admin/setup` and create admin user
- [ ] Configure restaurant settings
- [ ] Add categories and items
- [ ] Test WhatsApp and call buttons
- [ ] Generate QR code for `/ar`

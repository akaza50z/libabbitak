# Push to GitHub – Quick Steps

## 1. Create repo on GitHub

1. Open: **https://github.com/new**
2. **Repository name:** `libabbitak`
3. **Visibility:** Public
4. Do **not** initialize with README
5. Click **Create repository**

## 2. Add remote and push

Copy the repo URL from GitHub (e.g. `https://github.com/YOUR_USERNAME/libabbitak.git`), then run:

```powershell
cd c:\Users\LENOVO\Downloads\libabbitak
git remote add origin https://github.com/YOUR_USERNAME/libabbitak.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. (Remote is already set to `akaza50z` — if that's correct, just run `git push -u origin main` after creating the repo.)

If GitHub shows a URL with SSH instead (e.g. `git@github.com:...`), use that instead.

## 3. Deploy on the other Vercel account

1. Log in to Vercel with the other account
2. Go to **vercel.com/new**
3. Import the `libabbitak` repo from GitHub
4. Add env vars: `DATABASE_URL`, `SESSION_SECRET`
5. Deploy

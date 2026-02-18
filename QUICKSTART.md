# ⚡ Quick Start Guide

Get your admin system running in 5 minutes!

## Prerequisites

- Node.js 18+
- Supabase account (free tier works!)
- 5 minutes of your time

## Step 1: Get Supabase Database URL (2 min)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - Name: `portfolio-admin`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Click **Create new project** (takes ~2 min)
5. Once ready, go to **Settings** → **Database**
6. Find **Connection string** → Select **URI**
7. Copy it (looks like: `postgresql://postgres:...@....supabase.co:5432/postgres`)

## Step 2: Setup Environment (30 sec)

```bash
cd portfolio-admin

# Copy example env
cp .env.example .env

# Generate JWT secret (Windows PowerShell)
# Copy the output
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Now edit `.env`:
```env
DATABASE_URL="paste-your-supabase-url-here"
JWT_SECRET="paste-generated-secret-here"
```

## Step 3: Install & Setup Database (1 min)

```bash
# If you haven't installed dependencies yet
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

✅ Done! Your database is ready with:
- Admin user: `admin@alecam.dev`
- Password: `admin123456`
- Sample project and certification

## Step 4: Start Server (10 sec)

```bash
npm run dev
```

🎉 **That's it!** Open http://localhost:3000/dashboard

## Step 5: Test It (1 min)

### Login
1. Go to http://localhost:3000/login
2. Email: `admin@alecam.dev`
3. Password: `admin123456`
4. Click **Sign in**

### Try the API
```bash
# Get all projects
curl http://localhost:3000/api/projects

# Submit a contact message
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello from API!"}'
```

## What's Next?

### Change Admin Password
**Important!** Change the default password:
1. Create a new user with your password
2. Delete the default admin user
3. Or update the password directly in Prisma Studio:
   ```bash
   npx prisma studio
   ```

### Integrate with Your Frontend

In your `my-portfolio` project, fetch data:

```typescript
// Fetch projects
const response = await fetch('http://localhost:3000/api/projects');
const { projects } = await response.json();

// Submit contact form
await fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Your message'
  })
});
```

### Deploy to Production

When ready:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repo
   - Add environment variables (DATABASE_URL, JWT_SECRET)
   - Deploy!

3. **Set up custom domain:**
   - In Vercel: Settings → Domains
   - Add `admin.alecam.dev`
   - Update your DNS with the CNAME record

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npx prisma studio        # GUI for your database
npm run seed             # Reset & seed data

# View your data
npx prisma studio        # Opens at localhost:5555
```

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Can't connect to database"
- Check DATABASE_URL in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Verify Supabase project is active

### "Migration failed"
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### "Login not working"
- Check if you ran `npm run seed`
- Try clearing browser cookies
- Verify JWT_SECRET is set in `.env`

## Need Help?

Check out:
- 📖 [README.md](./README.md) - Full documentation
- 🚀 [SETUP.md](./SETUP.md) - Detailed setup guide
- 📡 [API.md](./API.md) - Complete API reference

---

**You're all set! Start building! 🚀**

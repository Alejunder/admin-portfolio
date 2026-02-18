# 🚀 Production Deployment Guide

This guide covers deploying both projects to production on Vercel.

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket** - Repositories pushed to your Git provider
3. **Supabase Database** - Already configured (connection string in .env)
4. **Custom Domain** - alecam.dev and admin.alecam.dev (optional but recommended)

---

## 🗂️ Project Structure

- **portfolio-admin** → Backend API + Admin Dashboard (admin.alecam.dev)
- **my-portfolio** → Public Frontend (alecam.dev)

---

## 📦 Part 1: Deploy Backend API (portfolio-admin)

### Step 1: Push to Git

```bash
cd c:\Users\Usuario\Desktop\portfolio-admin
git add .
git commit -m "🚀 Production configuration"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `portfolio-admin` repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./ (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

Go to **Project Settings → Environment Variables** and add:

```env
DATABASE_URL=postgresql://postgres.bqoozzswhylbfbgxcdfm:p0rt4f0li0%24%2A@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=dORCxU8Je42WJqPe5m5Fz2wxpTlz+FIVI+ABeTsdq4g=
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.alecam.dev
NEXT_PUBLIC_FRONTEND_URL=https://alecam.dev
SUPABASE_URL=https://bqoozzswhylbfbgxcdfm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxb296enN3aHlsYmZiZ3hjZGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4NTE3NCwiZXhwIjoyMDg2NTYxMTc0fQ.HjIjlrBSoXDghOSqrPbWewDhrYuKjmABu6_znase7uk
```

⚠️ **Important**: Add these to **Production**, **Preview**, and **Development** environments.

### Step 4: Configure Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add domain: `admin.alecam.dev`
3. Follow DNS configuration instructions from Vercel
4. Wait for SSL certificate to provision (1-5 minutes)

### Step 5: Verify Deployment

1. Visit your deployment URL (e.g., `https://portfolio-admin.vercel.app`)
2. Test API endpoints:
   - `GET /api/projects` - Should return projects list
   - `GET /api/certifications` - Should return certifications
   - `GET /api/about` - Should return about data
3. Test login at `/login`

---

## 🎨 Part 2: Deploy Frontend (my-portfolio)

### Step 1: Verify Environment Variables

The `.env` file is already configured for production:

```bash
cd c:\Users\Usuario\Desktop\my-portfolio
```

Verify `.env` contains:
```env
VITE_API_URL=https://admin.alecam.dev
```

### Step 2: Push to Git

```bash
git add .
git commit -m "🚀 Production configuration"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `my-portfolio` repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./ (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
   - **Install Command**: `npm install`

### Step 4: Add Environment Variables

Go to **Project Settings → Environment Variables** and add:

```env
VITE_API_URL=https://admin.alecam.dev
```

### Step 5: Configure Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add domain: `alecam.dev` and `www.alecam.dev`
3. Follow DNS configuration instructions
4. Wait for SSL certificate

### Step 6: Verify Deployment

1. Visit your deployment URL (e.g., `https://my-portfolio.vercel.app`)
2. Test pages load correctly
3. Test API integration:
   - Projects should load
   - Certifications should load
   - Contact form should submit
4. Check browser console for errors

---

## 🔄 Database Migrations

### Before First Deployment

Ensure your Supabase database is migrated:

```bash
cd c:\Users\Usuario\Desktop\portfolio-admin
npx prisma migrate deploy
npx prisma db seed
```

This will:
1. Run all migrations
2. Seed initial data (admin user, projects, certifications)

### After Deployment

For future schema changes:
1. Create migration: `npx prisma migrate dev --name your_migration_name`
2. Commit migration files
3. Push to Git
4. Vercel will auto-deploy
5. Run `npx prisma migrate deploy` in production (or use Vercel CLI)

---

## 🔐 Security Checklist

Before going live:

- [ ] **JWT_SECRET** is strong and unique (generated with `openssl rand -base64 32`)
- [ ] **Environment variables** are set in Vercel (not in code)
- [ ] **CORS origins** in `next.config.ts` match your production domains
- [ ] **Database password** is strong
- [ ] **.env files** are in .gitignore (never commit secrets!)
- [ ] **Admin password** has been changed from default
- [ ] **HTTPS** is enabled (Vercel does this automatically)
- [ ] **Test login** and verify JWT cookies work

---

## 🧪 Testing Production Locally

### Test Backend

```bash
cd c:\Users\Usuario\Desktop\portfolio-admin
$env:NODE_ENV="production"
npm run build
npm start
```

Visit: http://localhost:3000

### Test Frontend

```bash
cd c:\Users\Usuario\Desktop\my-portfolio
npm run build
npm run preview
```

Visit: http://localhost:4173

---

## 🚨 Troubleshooting

### Backend Issues

**Database Connection Errors:**
- Verify DATABASE_URL in Vercel environment variables
- Check Supabase connection pooling settings
- Ensure IP allowlist includes Vercel IPs (or use `0.0.0.0/0`)

**CORS Errors:**
- Update `next.config.ts` with correct frontend domain
- Verify NEXT_PUBLIC_FRONTEND_URL environment variable
- Check browser console for specific CORS error

**Authentication Issues:**
- Verify JWT_SECRET is set in Vercel
- Check cookie domain settings in `lib/auth.ts`
- Ensure `secure: true` in production cookie options

### Frontend Issues

**API Call Failures:**
- Verify VITE_API_URL environment variable in Vercel
- Check Network tab in browser dev tools
- Ensure backend is deployed and running

**Blank Page / Build Errors:**
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

**Environment Variables Not Working:**
- Vite requires `VITE_` prefix for public variables
- Redeploy after adding environment variables
- Verify variables are set for correct environment (Production/Preview)

---

## 📊 Monitoring & Logs

### Vercel Dashboard

1. **Deployments** - View build logs and deployment history
2. **Functions** - Monitor API route performance
3. **Analytics** - Track page views and performance
4. **Logs** - Real-time application logs

### Supabase Dashboard

1. **Database** - Monitor queries and connections
2. **Logs** - Database query logs
3. **Reports** - Performance metrics

---

## 🔄 Continuous Deployment (CD)

Both projects are configured for automatic deployments:

1. **Push to `main` branch** → Auto-deploy to production
2. **Push to other branches** → Preview deployments
3. **Pull requests** → Automatic preview URLs

### Manual Deployment

Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from terminal
cd c:\Users\Usuario\Desktop\portfolio-admin
vercel --prod

cd c:\Users\Usuario\Desktop\my-portfolio
vercel --prod
```

---

## 🎯 Post-Deployment Checklist

- [ ] Both projects deployed successfully
- [ ] Custom domains configured and SSL active
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Admin login works
- [ ] Public API endpoints respond
- [ ] Frontend loads projects and certifications
- [ ] Contact form submits successfully
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Performance is acceptable (check Lighthouse scores)

---

## 📞 Support

If you encounter issues:

1. Check Vercel build logs
2. Check browser console for errors
3. Review Supabase logs
4. Verify environment variables
5. Test locally with production settings

---

## 🎉 Success!

Your portfolio is now live! 

- **Frontend**: https://alecam.dev
- **Admin Panel**: https://admin.alecam.dev/dashboard
- **API**: https://admin.alecam.dev/api

Next steps:
- Monitor analytics
- Set up error tracking (Sentry)
- Configure backups
- Plan future features

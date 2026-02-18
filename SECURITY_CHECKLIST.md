# 🔒 Production Security Checklist

## Before Deployment

### 🔐 Secrets & Environment Variables

- [ ] **JWT_SECRET** is unique and strong (32+ characters)
  - Generate: `openssl rand -base64 32`
  - NEVER commit to Git
  - Set in Vercel environment variables

- [ ] **DATABASE_URL** uses connection pooling
  - Use Supabase pooler URL (not direct connection)
  - Format: `postgresql://postgres:PASSWORD@PROJECT.pooler.supabase.com:5432/postgres?sslmode=require`

- [ ] **SUPABASE_SERVICE_ROLE_KEY** is protected
  - NEVER expose to frontend
  - Only use in server-side API routes

- [ ] **.env files** are gitignored
  - Check .gitignore includes `.env*`
  - Verify .env files are not in Git history

- [ ] **Environment variables** set in Vercel
  - Production environment
  - Preview environment (optional)
  - Development environment (optional)

### 🌐 CORS & Domains

- [ ] **CORS origins** configured in `next.config.ts`
  - Update to match your production domain
  - Remove localhost from production

- [ ] **Cookie domain** settings reviewed
  - Check `lib/auth.ts` cookie configuration
  - Ensure `secure: true` in production

- [ ] **API URLs** updated
  - Frontend `VITE_API_URL` points to production backend
  - Backend `NEXT_PUBLIC_FRONTEND_URL` points to production frontend

### 🔒 Authentication & Authorization

- [ ] **Admin password** changed from seed default
  - Login to dashboard
  - Change password in settings (if implemented)
  - Or update via Prisma Studio

- [ ] **JWT expiration** is reasonable
  - Currently: 7 days
  - Adjust in `lib/auth.ts` if needed

- [ ] **Protected routes** tested
  - /dashboard requires authentication
  - /api/admin/* routes require ADMIN role

- [ ] **Rate limiting** considered
  - Use Vercel's built-in rate limiting
  - Or implement custom rate limiting for sensitive endpoints

### 🗄️ Database

- [ ] **Database migrations** applied
  - Run `npx prisma migrate deploy` in production
  - Verify all tables exist in Supabase

- [ ] **Database seeded** (if needed)
  - Run `npm run seed` to create initial data
  - Or manually create via dashboard

- [ ] **Database backups** enabled
  - Supabase provides automatic backups
  - Consider point-in-time recovery (PITR)

- [ ] **Connection pooling** enabled
  - Using Supabase pooler URL
  - Max connections configured

### 🚀 Build & Performance

- [ ] **Production build** tested locally
  ```bash
  # Backend
  npm run build && npm start
  
  # Frontend
  npm run build && npm run preview
  ```

- [ ] **No console errors** in production
  - Check browser console
  - Check Vercel function logs

- [ ] **API responses** are optimized
  - Use Prisma `select` to avoid overfetching
  - Implement pagination for large datasets

- [ ] **Images** optimized
  - Use Next.js Image component
  - Configure image domains in `next.config.ts`

### 🔍 Monitoring & Logging

- [ ] **Error logging** configured
  - Consider Sentry or similar
  - Check Vercel function logs

- [ ] **Analytics** setup (optional)
  - Vercel Analytics
  - Google Analytics
  - Plausible

- [ ] **Uptime monitoring** (optional)
  - UptimeRobot
  - Vercel monitoring

### 🌍 DNS & Domains

- [ ] **Custom domains** configured
  - admin.alecam.dev → Backend
  - alecam.dev → Frontend

- [ ] **SSL certificates** active
  - Vercel provides automatic SSL
  - Verify HTTPS works

- [ ] **DNS propagation** complete
  - Use https://www.whatsmydns.net/
  - Wait 24-48 hours for full propagation

## After Deployment

### ✅ Verification Tests

- [ ] **Public API endpoints** work
  ```bash
  curl https://admin.alecam.dev/api/projects
  curl https://admin.alecam.dev/api/certifications
  curl https://admin.alecam.dev/api/about
  ```

- [ ] **Admin login** works
  - Visit https://admin.alecam.dev/login
  - Login with admin credentials
  - Verify redirect to dashboard

- [ ] **Dashboard CRUD** works
  - Create a project
  - Update a project
  - Delete a project

- [ ] **Frontend integration** works
  - Visit https://alecam.dev
  - Verify projects load
  - Verify certifications load
  - Test contact form

- [ ] **Authentication flow** works
  - Login sets cookie
  - Protected routes require auth
  - Logout clears cookie

- [ ] **CORS** works
  - Frontend can call backend API
  - No CORS errors in console

### 🔄 Continuous Integration

- [ ] **Auto-deployment** configured
  - Push to main → auto-deploy
  - Preview deployments work

- [ ] **Build process** is stable
  - No build errors
  - Dependencies locked (package-lock.json)

### 📊 Performance

- [ ] **Lighthouse score** acceptable
  - Run on https://alecam.dev
  - Aim for 90+ performance

- [ ] **API response times** acceptable
  - < 200ms for simple queries
  - < 500ms for complex queries

- [ ] **Database queries** optimized
  - Check Supabase slow query log
  - Add indexes where needed

## Security Best Practices

### 🛡️ Code Security

- [ ] **Input validation** on all endpoints
  - Using Zod schemas
  - Never trust user input

- [ ] **SQL injection** prevention
  - Prisma handles this automatically
  - Never use raw SQL with user input

- [ ] **XSS protection**
  - React escapes by default
  - Be careful with `dangerouslySetInnerHTML`

- [ ] **CSRF protection**
  - Using HTTP-only cookies
  - SameSite cookie attribute

### 🔐 Infrastructure Security

- [ ] **HTTPS enforced**
  - Vercel handles this
  - No HTTP endpoints exposed

- [ ] **Security headers** set
  - X-Frame-Options
  - X-Content-Type-Options
  - Configured in `next.config.ts`

- [ ] **Dependency audit**
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] **Sensitive data** not exposed
  - No secrets in frontend code
  - No API keys in client-side bundles

## Maintenance

### 🔄 Regular Tasks

- [ ] **Update dependencies** monthly
  ```bash
  npm outdated
  npm update
  ```

- [ ] **Review logs** weekly
  - Check for errors
  - Monitor performance

- [ ] **Backup database** (automatic with Supabase)
  - Verify backups are running
  - Test restore process

- [ ] **Security patches** immediately
  - Monitor GitHub security alerts
  - Update critical dependencies ASAP

### 📈 Scaling Considerations

- [ ] **Database scaling plan**
  - Monitor connection count
  - Upgrade Supabase tier if needed

- [ ] **API rate limits**
  - Implement if traffic grows
  - Use Vercel Edge Config

- [ ] **CDN for static assets**
  - Vercel handles this automatically
  - Consider separate CDN for large files

## Incident Response

### 🚨 If Something Goes Wrong

1. **Check Vercel logs**
   - Function logs
   - Build logs
   
2. **Check Supabase logs**
   - Query logs
   - Connection logs

3. **Roll back deployment**
   ```bash
   vercel rollback
   ```

4. **Contact support**
   - Vercel support: vercel.com/support
   - Supabase support: supabase.com/support

---

## 📝 Production Checklist Summary

Use this quick checklist before each deployment:

```
Environment Variables
  ✓ JWT_SECRET set
  ✓ DATABASE_URL set
  ✓ All env vars in Vercel

Security
  ✓ Admin password changed
  ✓ CORS configured
  ✓ HTTPS enabled

Database
  ✓ Migrations applied
  ✓ Seed data loaded

Testing
  ✓ Production build works locally
  ✓ API endpoints respond
  ✓ Frontend connects to API
  ✓ Authentication works

Post-Deployment
  ✓ Custom domains configured
  ✓ SSL active
  ✓ No console errors
  ✓ Lighthouse score acceptable
```

---

**Last Updated**: February 18, 2026

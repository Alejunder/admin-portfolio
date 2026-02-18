# Quick Reference - Frontend-Backend Integration

Quick commands and references for daily development.

---

## 🚀 Start Development Servers

### Backend (Admin + API)
```bash
cd portfolio-admin
npm run dev
```
→ **Admin Dashboard:** http://localhost:3000/dashboard  
→ **API Base:** http://localhost:3000/api

### Frontend (Public Site)
```bash
cd my-portfolio
npm run dev
```
→ **Public Site:** http://localhost:5173

---

## 🔑 Admin Credentials

**URL:** http://localhost:3000/dashboard

```
Email: admin@alecam.dev
Password: admin123456
```

⚠️ **Change in production!**

---

## 📡 API Endpoints Reference

### Public Endpoints (No Auth)

```bash
# About
GET http://localhost:3000/api/about

# Projects
GET http://localhost:3000/api/projects
GET http://localhost:3000/api/projects?featured=true
GET http://localhost:3000/api/projects/{slug}

# Certifications
GET http://localhost:3000/api/certifications
GET http://localhost:3000/api/certifications?featured=true
GET http://localhost:3000/api/certifications/{id}

# Contact
POST http://localhost:3000/api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

### Admin Endpoints (JWT Required)

```bash
# About
GET http://localhost:3000/api/admin/about
PUT http://localhost:3000/api/admin/about

# Projects
GET    http://localhost:3000/api/admin/projects
POST   http://localhost:3000/api/admin/projects
PATCH  http://localhost:3000/api/admin/projects/{id}
DELETE http://localhost:3000/api/admin/projects/{id}

# Certifications
GET    http://localhost:3000/api/admin/certifications
POST   http://localhost:3000/api/admin/certifications
PATCH  http://localhost:3000/api/admin/certifications/{id}
DELETE http://localhost:3000/api/admin/certifications/{id}

# Contact
GET    http://localhost:3000/api/admin/contact
DELETE http://localhost:3000/api/admin/contact/{id}
```

---

## 🔄 Common Tasks

### Update Database Schema

```bash
cd portfolio-admin

# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_change_description

# 3. Generate Prisma client
npx prisma generate

# 4. Restart dev server
npm run dev
```

### Seed Database

```bash
cd portfolio-admin
npm run seed
```

### View Database (Prisma Studio)

```bash
cd portfolio-admin
npx prisma studio
```
→ Opens at http://localhost:5555

### Reset Database (DESTRUCTIVE)

```bash
cd portfolio-admin
npx prisma migrate reset
# This will delete all data and re-run migrations + seed
```

---

## 🐛 Troubleshooting Commands

### Backend Not Starting

```bash
cd portfolio-admin

# Check for running processes
Get-Process node | Stop-Process  # Windows
# or
killall node  # macOS/Linux

# Clear Next.js cache
rm -rf .next  # macOS/Linux
Remove-Item -Recurse -Force .next  # Windows

# Reinstall dependencies
npm install

# Start fresh
npm run dev
```

### Frontend Not Fetching Data

```bash
# 1. Check environment variable
cat .env  # macOS/Linux
Get-Content .env  # Windows

# Should contain:
# VITE_API_URL=http://localhost:3000

# 2. Restart frontend
npm run dev
```

### Database Connection Issues

```bash
cd portfolio-admin

# Test connection
npx prisma db pull

# If fails, check DATABASE_URL in .env
```

### TypeScript Errors

```bash
cd portfolio-admin

# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code:
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 📦 Deployment Commands

### Backend (Vercel)

```bash
cd portfolio-admin

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment variables (set in Vercel dashboard):
# - DATABASE_URL
# - JWT_SECRET
# - NODE_ENV=production
```

### Frontend (Vercel)

```bash
cd my-portfolio

# Deploy
vercel

# Environment variable (set in Vercel dashboard):
# - VITE_API_URL=https://admin.alecam.dev
```

---

## 🔍 Useful Queries

### Check What's in Database

```bash
cd portfolio-admin
npx prisma studio
```

Or use SQL:

```sql
-- Count records
SELECT COUNT(*) FROM about;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM certifications;
SELECT COUNT(*) FROM contact_messages;

-- View all projects
SELECT slug, title, published, featured FROM projects;

-- View unread messages
SELECT name, email, created_at FROM contact_messages WHERE status = 'UNREAD';
```

---

## 📝 Testing with curl

### Test Public API

```bash
# Get about
curl http://localhost:3000/api/about

# Get projects
curl http://localhost:3000/api/projects

# Send contact message
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello!"}'
```

### Test Admin API (requires JWT)

```bash
# 1. Login to get token (via browser)
# 2. Copy token from browser cookies
# 3. Use in subsequent requests

curl -X GET http://localhost:3000/api/admin/about \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## 🎨 Frontend API Usage

### Fetch About Data

```javascript
import { getAbout } from '../services/api';

const response = await getAbout();
if (response.success) {
  const about = response.data;
  console.log(about.title.en);
}
```

### Fetch Projects

```javascript
import { getProjects } from '../services/api';

const response = await getProjects({ featured: true });
if (response.success) {
  const projects = response.data;
  projects.forEach(p => console.log(p.title.en));
}
```

### Send Contact Message

```javascript
import { sendContactMessage } from '../services/api';

const response = await sendContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});

if (response.success) {
  console.log('Message sent!');
}
```

---

## 📊 Database Models Quick Reference

### About
```typescript
{
  id: string
  title: { en: string, es: string }
  description: { en: string, es: string }
  shortBio?: { en: string, es: string } | null
  location?: string | null
  email?: string | null
  updatedAt: Date
}
```

### Project
```typescript
{
  id: string
  slug: string
  title: { en: string, es: string }
  description: { en: string, es: string }
  technologies: string[]
  accentColor: string
  imageUrl?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
  published: boolean
  featured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Certification
```typescript
{
  id: string
  title: { en: string, es: string }
  issuer: { en: string, es: string }
  imageUrl: string
  credentialUrl?: string | null
  published: boolean
  featured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### ContactMessage
```typescript
{
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000"
```

---

## 📚 Important Files

### Backend
- `prisma/schema.prisma` - Database models
- `lib/validators.ts` - Zod schemas
- `lib/auth.ts` - JWT utilities
- `app/api/*` - API routes
- `app/dashboard/page.tsx` - Admin UI

### Frontend
- `src/services/api.js` - API client
- `src/types/api.ts` - TypeScript types
- `src/sections/*` - Page sections
- `.env` - Environment config

---

## 🆘 Help & Documentation

- **Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Reference:** [API.md](./API.md)
- **Setup:** [SETUP.md](./SETUP.md)
- **Completion Summary:** [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)

---

**Quick Tip:** Bookmark this file for easy reference during development! 📌

# Frontend-Backend Integration Guide

**Last Updated:** February 17, 2026  
**Project:** alecam.dev Portfolio System  
**Architecture:** React Frontend + Next.js API + PostgreSQL Database

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Frontend Integration](#frontend-integration)
5. [Admin Dashboard Usage](#admin-dashboard-usage)
6. [Adding New Features](#adding-new-features)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Overview

### Architecture Components

```
┌─────────────────────┐
│   alecam.dev        │
│   (React + Vite)    │  ← Public Frontend
└──────────┬──────────┘
           │
           │ HTTP/HTTPS
           │ fetch()
           ▼
┌─────────────────────┐
│ admin.alecam.dev    │
│ (Next.js API)       │  ← Backend API
└──────────┬──────────┘
           │
           │ Prisma ORM
           ▼
┌─────────────────────┐
│   PostgreSQL        │
│   (Supabase)        │  ← Database
└─────────────────────┘
```

### Technology Stack

**Frontend (my-portfolio):**
- React 19
- Vite 7
- React Router DOM 7
- Framer Motion (animations)
- i18next (internationalization)

**Backend (portfolio-admin):**
- Next.js 15 (App Router)
- Prisma (ORM)
- PostgreSQL (Supabase)
- JWT authentication
- Zod validation

---

## 🔄 Data Flow Architecture

### How Data Flows from Database to User

```
1. Admin creates/updates content in Dashboard
   ↓
2. Dashboard sends request to Admin API (/api/admin/*)
   ↓
3. API validates with Zod, authenticates with JWT
   ↓
4. Prisma writes to PostgreSQL database
   ↓
5. Public frontend fetches from Public API (/api/*)
   ↓
6. React components render the data
   ↓
7. User sees updated content
```

### Content Update Propagation

When an admin updates content:

1. **Immediate:** Database is updated
2. **Next Frontend Load:** Fresh data is fetched
3. **No Cache Issues:** API responses are not cached (default fetch behavior)

**Example Flow:**

```javascript
// Admin edits "About" section
Admin Dashboard → PUT /api/admin/about
                → Prisma updates database
                → Returns updated data

// Frontend fetches updated content
React Component → useEffect on mount
                → GET /api/about
                → Prisma reads from database
                → Returns latest data
                → Component re-renders with new content
```

---

## 🔌 API Endpoints Reference

### Public Endpoints (No Authentication Required)

#### About Section

```http
GET /api/about
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "about-main",
    "title": { "en": "About Me", "es": "Sobre Mí" },
    "description": { "en": "...", "es": "..." },
    "shortBio": { "en": "...", "es": "..." },
    "location": "Lima, Peru",
    "email": "contact@alecam.dev",
    "updatedAt": "2026-02-17T..."
  }
}
```

#### Projects

```http
GET /api/projects
GET /api/projects?featured=true
GET /api/projects/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "slug": "copilot4yt",
      "title": { "en": "AI Thumbnail Generator", "es": "..." },
      "description": { "en": "...", "es": "..." },
      "technologies": ["React", "OpenAI API"],
      "accentColor": "#9a031e",
      "imageUrl": "https://...",
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://copilot4yt.vercel.app/",
      "featured": true,
      "published": true,
      "order": 1
    }
  ]
}
```

#### Certifications

```http
GET /api/certifications
GET /api/certifications?featured=true
GET /api/certifications/{id}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cert-postgresql",
      "title": { "en": "PostgreSQL", "es": "PostgreSQL" },
      "issuer": { "en": "Platzi", "es": "Platzi" },
      "imageUrl": "/certifications/diploma-postgresql.jpg",
      "credentialUrl": "https://platzi.com/...",
      "published": true,
      "featured": true,
      "order": 0
    }
  ]
}
```

#### Contact

```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss a project..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully",
  "id": "msg_..."
}
```

### Admin Endpoints (JWT Required, ADMIN Role)

#### About Management

```http
GET /api/admin/about
PUT /api/admin/about
```

#### Projects Management

```http
GET    /api/admin/projects
POST   /api/admin/projects
GET    /api/admin/projects/{id}
PATCH  /api/admin/projects/{id}
DELETE /api/admin/projects/{id}
```

#### Certifications Management

```http
GET    /api/admin/certifications
POST   /api/admin/certifications
GET    /api/admin/certifications/{id}
PATCH  /api/admin/certifications/{id}
DELETE /api/admin/certifications/{id}
```

#### Contact Messages

```http
GET    /api/admin/contact
DELETE /api/admin/contact/{id}
```

---

## 💻 Frontend Integration

### Environment Configuration

**File:** `my-portfolio/.env`

```env
VITE_API_URL=http://localhost:3000
# Production: VITE_API_URL=https://admin.alecam.dev
```

### API Service Layer

**File:** `my-portfolio/src/services/api.js`

All API calls are centralized in this file. Components should import from here:

```javascript
import { getAbout, getProjects, getCertifications, sendContactMessage } from '../services/api';
```

### Component Integration Pattern

**Best Practice Example:**

```javascript
import { useState, useEffect } from 'react';
import { getProjects } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getProjects({ featured: true });
        
        if (response.success && response.data) {
          setProjects(response.data);
        } else {
          setError(response.error || 'Failed to load projects');
        }
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <section>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}
```

### Multi-language Support (i18n)

Content from API is already bilingual:

```javascript
import { useTranslation } from 'react-i18next';

function Component() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  // Use the current language to get the right text
  const title = project.title[currentLanguage] || project.title.en;
  const description = project.description[currentLanguage] || project.description.en;
}
```

---

## 🎛️ Admin Dashboard Usage

### Accessing the Dashboard

1. Navigate to: `http://localhost:3000/dashboard` (dev) or `https://admin.alecam.dev/dashboard` (prod)
2. Login with admin credentials:
   - Email: `admin@alecam.dev`
   - Password: `admin123456` (change this in production!)

### Managing About Section

1. Click the **"About"** tab
2. Edit the form fields:
   - Title (English & Spanish)
   - Description (English & Spanish)
   - Short Bio (optional, English & Spanish)
   - Location (optional)
   - Email (optional)
3. Click **"Save Changes"**
4. Changes are immediately saved to database
5. Frontend will show updated content on next page load

### Managing Projects

**Add New Project:**
1. Go to **"Projects"** tab
2. Click **"+ Add Project"**
3. Fill in:
   - Slug (URL-friendly, e.g., `my-cool-project`)
   - Title (English & Spanish)
   - Description (English & Spanish)
   - Technologies (array: `["React", "Node.js"]`)
   - Accent Color (hex: `#ff6b6b`)
   - Image URL (optional)
   - GitHub URL (optional)
   - Live URL (optional)
   - Published (checkbox)
   - Featured (checkbox)
   - Order (number for sorting)
4. Submit

**Edit Project:**
1. Click **"Edit"** on any project
2. Modify fields
3. Save

**Toggle Visibility:**
- Click **"Publish"** / **"Unpublish"** to control visibility on frontend

**Delete Project:**
- Click **"Delete"** → Confirm

### Managing Certifications

Same pattern as Projects:
- Add, Edit, Delete
- Toggle Published/Featured
- Order by number

### Viewing Contact Messages

1. Go to **"Contact"** tab
2. View all submitted messages
3. Status: UNREAD / READ / ARCHIVED
4. Delete messages when handled

---

## 🚀 Adding New Features

### Adding a New Content Section

**Example: Adding a "Services" section**

#### 1. Update Prisma Schema

```prisma
// prisma/schema.prisma

model Service {
  id          String   @id @default(cuid())
  title       Json     // { "en": "...", "es": "..." }
  description Json
  icon        String?
  price       String?
  published   Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([published, order])
  @@map("services")
}
```

#### 2. Create Migration

```bash
npx prisma migrate dev --name add_services
npx prisma generate
```

#### 3. Add Validators

```typescript
// lib/validators.ts

export const createServiceSchema = z.object({
  title: i18nStringSchema,
  description: i18nStringSchema,
  icon: z.string().optional(),
  price: z.string().optional(),
  published: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});
```

#### 4. Create Public API Route

```typescript
// app/api/services/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }],
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
```

#### 5. Create Admin API Route

```typescript
// app/api/admin/services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { createServiceSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: [{ order: 'asc' }],
  });

  return NextResponse.json({ success: true, data: services });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = createServiceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: result.error.issues },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: result.data,
  });

  return NextResponse.json({ success: true, data: service });
}
```

#### 6. Add to Frontend API Service

```javascript
// my-portfolio/src/services/api.js

export async function getServices() {
  return apiFetch('/api/services');
}
```

#### 7. Add to Frontend Component

```javascript
// my-portfolio/src/sections/Services.jsx

import { useState, useEffect } from 'react';
import { getServices } from '../services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  // ... fetch and render
}
```

#### 8. Add to Admin Dashboard

Add a new tab in `app/dashboard/page.tsx` following the pattern of Projects/Certifications.

---

## 🐛 Troubleshooting

### Frontend Not Showing Updated Data

**Problem:** Changes in admin don't appear on frontend

**Solutions:**
1. Hard refresh frontend (Ctrl+Shift+R / Cmd+Shift+R)
2. Check API URL in frontend `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. Check browser console for API errors
4. Verify backend is running on port 3000

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` error

**Solution:** Backend automatically handles CORS. If issue persists, check:
- Frontend is making requests to correct API URL
- Backend middleware is allowing frontend origin

### Authentication Issues

**Problem:** "Unauthorized" errors in admin

**Solutions:**
1. Clear cookies and log in again
2. Check JWT_SECRET is set in backend `.env`
3. Ensure middleware is protecting correct routes

### Database Connection Issues

**Problem:** "Can't reach database server"

**Solutions:**
1. Check `DATABASE_URL` in backend `.env`
2. Verify Supabase instance is running
3. Check SSL configuration in Prisma connection

### API Not Returning Data

**Problem:** API returns empty or null data

**Solutions:**
1. Run seed: `npm run seed` in portfolio-admin
2. Check database has data: `npx prisma studio`
3. Verify Prisma schema matches database schema
4. Run: `npx prisma generate` after schema changes

---

## 📝 Development Workflow

### Making Changes

1. **Update Database Schema:**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name your_migration_name
   npx prisma generate
   ```

2. **Update Validators:**
   ```bash
   # Edit lib/validators.ts
   ```

3. **Create/Update API Routes:**
   ```bash
   # app/api/your-route/route.ts
   ```

4. **Update Frontend:**
   ```bash
   # src/services/api.js (add fetch function)
   # src/sections/YourSection.jsx (use the API)
   ```

5. **Test:**
   - Backend: `npm run dev` (portfolio-admin)
   - Frontend: `npm run dev` (my-portfolio)
   - Visit http://localhost:5173 (frontend)
   - Visit http://localhost:3000/dashboard (admin)

### Deployment Checklist

**Backend (Vercel):**
- [ ] Set environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`
- [ ] Run migrations on production DB
- [ ] Seed database if needed
- [ ] Test API endpoints

**Frontend (Vercel):**
- [ ] Set environment variable:
  - `VITE_API_URL=https://admin.alecam.dev`
- [ ] Build and deploy
- [ ] Test all sections load correctly
- [ ] Test contact form submission

---

## 🔐 Security Considerations

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Change default admin password** immediately in production
3. **Use strong JWT_SECRET** - Generate with: `openssl rand -base64 32`
4. **Validate all inputs** - Use Zod schemas on all endpoints
5. **Sanitize user content** - Especially in contact messages
6. **Use HTTPS** in production - Always
7. **Rate limit sensitive endpoints** - Consider adding in production

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Zod Documentation](https://zod.dev)

---

**Questions or Issues?**  
Check the existing documentation files:
- `/ARCHITECTURE.md` - System architecture details
- `/API.md` - Complete API reference
- `/SETUP.md` - Initial setup instructions
- `/QUICKSTART.md` - Quick start guide

---

*Last updated: February 17, 2026*

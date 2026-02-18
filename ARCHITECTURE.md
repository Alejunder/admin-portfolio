# alecam.dev System Architecture

Complete architecture documentation for the personal portfolio website with admin panel and API backend.

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        END USERS                                │
│                     (alecam.dev visitors)                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              PUBLIC FRONTEND (alecam.dev)                       │
│                   React + Vite + TypeScript                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  • Projects Section (dynamic)                             │ │
│  │  • Certifications Gallery (dynamic)                       │ │
│  │  • Contact Form (submits to API)                          │ │
│  │  • i18n (EN/ES) - data from API                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ fetch() → HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           ADMIN PANEL + API (admin.alecam.dev)                  │
│                Next.js 15 App Router + TypeScript               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PUBLIC API ROUTES (/api/*)                               │ │
│  │    • GET /api/projects                                    │ │
│  │    • GET /api/projects/:slug                              │ │
│  │    • GET /api/certifications                              │ │
│  │    • POST /api/contact                                    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  ADMIN API ROUTES (/api/admin/*)                          │ │
│  │    • Full CRUD for projects                               │ │
│  │    • Full CRUD for certifications                         │ │
│  │    • View contact messages                                │ │
│  │    [Protected by JWT middleware]                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  ADMIN DASHBOARD UI (/dashboard)                          │ │
│  │    • Projects management (table, edit, delete)            │ │
│  │    • Certifications management                            │ │
│  │    • Contact messages viewer                              │ │
│  │    [Protected by JWT cookies]                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Prisma ORM
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│            DATABASE (PostgreSQL on Supabase)                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Tables:                                                  │ │
│  │    • users (admin authentication)                         │ │
│  │    • projects (portfolio projects with i18n)              │ │
│  │    • certifications (credentials with i18n)               │ │
│  │    • contact_messages (form submissions)                  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **1. Viewing Projects (Public)**

```
User visits alecam.dev
  ↓
Projects.jsx component mounts
  ↓
useEffect() calls fetchProjects()
  ↓
fetch('https://admin.alecam.dev/api/projects?featured=true')
  ↓
Next.js API Route: /api/projects/route.ts
  ↓
Prisma query: findMany({ where: { published: true, featured: true } })
  ↓
PostgreSQL returns projects with i18n data (JSON)
  ↓
API response: { success: true, data: [...projects] }
  ↓
Frontend receives data
  ↓
Component extracts title[language] and description[language]
  ↓
ProjectCarousel displays projects
```

### **2. Admin Editing Projects**

```
Admin logs in (/login)
  ↓
JWT token stored in HTTP-only cookie
  ↓
Admin navigates to /dashboard
  ↓
Middleware validates JWT on server
  ↓
Dashboard loads projects via /api/admin/projects
  ↓
Admin clicks "Edit" on a project
  ↓
Form shows current data: { title: { en, es }, description: { en, es }, ... }
  ↓
Admin updates English title
  ↓
PATCH /api/admin/projects/:id with updated data
  ↓
Prisma updates database
  ↓
Success response
  ↓
Dashboard refreshes list
  ↓
Public API now returns updated data
```

### **3. Contact Form Submission**

```
User fills contact form on alecam.dev
  ↓
Submits form
  ↓
POST https://admin.alecam.dev/api/contact
  ↓
Next.js API Route: /api/contact/route.ts
  ↓
Zod validation checks: name, email, message
  ↓
Prisma creates new ContactMessage record
  ↓
Email notification sent (optional feature)
  ↓
Response: { success: true, message: "Message sent!" }
  ↓
Frontend shows success message
  ↓
Admin can view message in /dashboard (Contact tab)
```

---

## 📂 Project Structure

### **Admin Panel (portfolio-admin)**

```
portfolio-admin/
├── app/
│   ├── api/                      # API routes
│   │   ├── projects/
│   │   │   ├── route.ts         # GET /api/projects (public)
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET /api/projects/:id (public)
│   │   ├── certifications/
│   │   │   ├── route.ts         # GET /api/certifications (public)
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET /api/certifications/:id (public)
│   │   ├── contact/
│   │   │   └── route.ts         # POST /api/contact (public)
│   │   ├── admin/               # Protected routes (JWT required)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts     # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PATCH, DELETE
│   │   │   ├── certifications/
│   │   │   │   ├── route.ts     # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PATCH, DELETE
│   │   │   └── contact/
│   │   │       ├── route.ts     # GET (list messages)
│   │   │       └── [id]/
│   │   │           └── route.ts # DELETE message
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts     # POST (authenticate)
│   │       ├── logout/
│   │       │   └── route.ts     # POST (clear cookie)
│   │       └── me/
│   │           └── route.ts     # GET (verify session)
│   ├── dashboard/
│   │   └── page.tsx             # Admin UI (projects, certs, messages)
│   └── login/
│       └── page.tsx             # Login form
├── lib/
│   ├── auth.ts                  # JWT utilities, isAdmin()
│   ├── db.ts                    # Prisma client singleton
│   └── validators.ts            # Zod schemas for all data
├── prisma/
│   ├── schema.prisma            # Database models
│   ├── seed.ts                  # Initial data
│   └── migrations/              # Database migrations
├── middleware.ts                # Route protection
└── .env                         # DATABASE_URL, JWT_SECRET
```

### **Public Frontend (my-portfolio)**

```
my-portfolio/
├── src/
│   ├── services/
│   │   └── api.js               # API integration layer
│   ├── sections/
│   │   ├── Projects.jsx         # Fetches from API
│   │   ├── Certifications.jsx   # Fetches from API
│   │   └── Contact.jsx          # Submits to API
│   ├── pages/
│   │   └── CertificacionesPage.jsx  # Fetches from API
│   └── locales/
│       ├── eng.json             # Static UI translations only
│       └── esp.json             # (content comes from API)
└── .env
    └── VITE_API_URL=https://admin.alecam.dev/api
```

---

## 🔐 Authentication & Security

### **Admin Authentication Flow**

```
1. Admin visits /login
2. Enters email + password
3. POST /api/auth/login
4. Server validates credentials (bcrypt compare)
5. Server signs JWT with user data
6. JWT stored in HTTP-only cookie
7. Redirect to /dashboard
8. Every request includes cookie automatically
9. middleware.ts intercepts /dashboard/* and /api/admin/*
10. Validates JWT, allows/denies access
```

### **Security Measures**

| Layer | Protection |
|-------|------------|
| **Passwords** | Bcrypt hashing (10 salt rounds) |
| **Sessions** | JWT tokens in HTTP-only cookies |
| **API Routes** | Middleware checks for ADMIN role |
| **Database** | Prisma parameterized queries (SQL injection safe) |
| **Input** | Zod validation on all incoming data |
| **Public API** | Only returns `published: true` records |
| **CORS** | Next.js handles CORS automatically |

---

## 🌍 Internationalization (i18n)

### **How i18n Works**

1. **Database stores multilingual content**:
   ```json
   {
     "title": {
       "en": "AI Thumbnail Generator",
       "es": "Generador de miniaturas con IA"
     }
   }
   ```

2. **Frontend detects user language**:
   ```javascript
   const { i18n } = useTranslation();
   const currentLang = i18n.language; // "en" or "es"
   ```

3. **Frontend extracts correct language**:
   ```javascript
   const title = project.title[currentLang] || project.title.en;
   ```

### **Adding a New Language**

To add French (fr):

1. **Update Prisma schema** (no changes needed - JSON fields are flexible)
2. **Update admin dashboard** to accept `fr` input
3. **Update validators**:
   ```typescript
   const i18nStringSchema = z.object({
     en: z.string(),
     es: z.string(),
     fr: z.string(), // Add this
   });
   ```
4. **Seed data** with `fr` translations
5. **Frontend** uses `project.title.fr`

---

## 📊 Database Schema (Simplified)

```typescript
model Project {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        Json     // { en: "...", es: "..." }
  description  Json     // { en: "...", es: "..." }
  technologies String[]
  accentColor  String
  published    Boolean  @default(true)
  featured     Boolean  @default(false)
  order        Int      @default(0)
  // ... URLs, timestamps
}

model Certification {
  id            String   @id @default(cuid())
  title         Json     // { en: "...", es: "..." }
  issuer        Json     // { en: "...", es: "..." }
  imageUrl      String
  credentialUrl String?
  published     Boolean  @default(true)
  featured      Boolean  @default(false)
  order         Int      @default(0)
  // ... timestamps
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  status    MessageStatus  @default(UNREAD)
  createdAt DateTime @default(now())
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String // bcrypt hash
  role     Role   @default(ADMIN)
}
```

---

## 🚀 Deployment Architecture

### **Production Setup**

```
┌──────────────────────────┐
│  Vercel (Frontend)       │  ← alecam.dev
│  React + Vite build      │
└──────────┬───────────────┘
           │
           │ API calls
           ▼
┌──────────────────────────┐
│  Vercel (Admin Panel)    │  ← admin.alecam.dev
│  Next.js serverless      │
└──────────┬───────────────┘
           │
           │ Prisma
           ▼
┌──────────────────────────┐
│  Supabase (PostgreSQL)   │
│  Database + Storage      │
└──────────────────────────┘
```

### **Environment Variables**

**Admin Panel (.env)**:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

**Frontend (.env)**:
```env
VITE_API_URL=https://admin.alecam.dev/api
```

---

## 🔄 How to Add New Dynamic Sections

Want to add a blog, testimonials, or skills section? Follow this pattern:

### **1. Create Database Model**

```prisma
// prisma/schema.prisma
model BlogPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       Json     // i18n
  content     Json     // i18n
  published   Boolean  @default(true)
  publishedAt DateTime @default(now())
}
```

### **2. Create Validators**

```typescript
// lib/validators.ts
export const createBlogPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: i18nStringSchema,
  content: i18nStringSchema,
  published: z.boolean().default(true),
});
```

### **3. Create API Routes**

```typescript
// app/api/blog/route.ts
export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: posts });
}
```

```typescript
// app/api/admin/blog/route.ts
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const result = createBlogPostSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json({ success: false, error: 'Validation failed', details: result.error.errors }, { status: 400 });
  }
  
  const post = await prisma.blogPost.create({ data: result.data });
  return NextResponse.json({ success: true, data: post }, { status: 201 });
}
```

### **4. Update Admin Dashboard**

Add a new tab in `/dashboard/page.tsx`:

```tsx
<button onClick={() => setActiveTab('blog')}>
  Blog Posts
</button>
```

Add table view for blog posts with CRUD operations.

### **5. Integrate in Frontend**

```javascript
// src/services/api.js
export async function fetchBlogPosts() {
  const response = await fetch(`${API_BASE_URL}/blog`);
  const data = await response.json();
  return data.data;
}
```

```jsx
// src/sections/Blog.jsx
const [posts, setPosts] = useState([]);

useEffect(() => {
  fetchBlogPosts().then(setPosts);
}, []);
```

---

## 🧪 Testing Endpoints

```bash
# Public endpoints
curl https://admin.alecam.dev/api/projects
curl https://admin.alecam.dev/api/certifications

# Admin endpoints (requires authentication)
curl -X POST https://admin.alecam.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alecam.dev","password":"admin123456"}' \
  -c cookies.txt

curl -X GET https://admin.alecam.dev/api/admin/projects \
  -b cookies.txt
```

---

## 📱 Frontend-Backend Sync

### **When Admin Updates Content**

1. Admin changes project title in dashboard
2. Database updated immediately
3. Public API returns new data on next request
4. Frontend user sees updated content (no cache)

### **Caching Strategy (Optional)**

For better performance, implement:

- **Client-side**: SWR or React Query for data caching
- **Server-side**: Next.js `revalidate` in API routes
- **CDN**: Cache static assets on Vercel Edge

---

## 🎯 Key Benefits of This Architecture

✅ **Clean Separation**: Frontend never touches database  
✅ **Scalable**: Easy to add new content types  
✅ **Secure**: Admin routes protected, public routes filtered  
✅ **i18n Ready**: Multi-language support built-in  
✅ **Type-Safe**: TypeScript + Zod validation  
✅ **Production-Ready**: Following best practices  
✅ **Maintainable**: Clear patterns and documentation  

---

## 🛠️ Development Workflow

```bash
# Admin panel development
cd portfolio-admin
npm run dev          # Start Next.js dev server
npx prisma studio    # View database

# Frontend development  
cd my-portfolio
npm run dev          # Start Vite dev server

# Both should use localhost API in development
# Admin: http://localhost:3000/api
```

---

## 📚 Next Steps

1. **Enhance Forms**: Create proper modal forms in admin dashboard
2. **Image Upload**: Implement file upload for project/certification images
3. **Blog**: Add blog system following the pattern above
4. **Analytics**: Track API usage and errors
5. **Email**: Send notifications when contact form is submitted
6. **Search**: Add search functionality to admin dashboard
7. **Bulk Actions**: Select multiple items and publish/delete together

---

This architecture is designed to be **production-ready, scalable, and maintainable** while keeping things **simple and following best practices**.

For any questions, refer to the codebase or the [Frontend Integration Guide](./FRONTEND_INTEGRATION.md).

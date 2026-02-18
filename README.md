# Portfolio Admin + API

Production-ready admin dashboard and API system for **alecam.dev** personal portfolio website.

## 🚀 Features

- **Admin Dashboard**: Secure admin interface at `admin.alecam.dev/dashboard`
- **RESTful API**: Complete API for managing projects, certifications, and contact messages
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Role-Based Access**: Admin-only access to protected routes
- **CORS Enabled**: Configured to work with your frontend at `alecam.dev`
- **Type-Safe**: Full TypeScript implementation
- **Validated**: Zod schemas for all API inputs
- **Production Ready**: Configured for Vercel deployment

## 📁 Project Structure

```
portfolio-admin/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/         # POST /api/auth/login
│   │   │   ├── logout/        # POST /api/auth/logout
│   │   │   └── me/            # GET /api/auth/me
│   │   ├── projects/          # GET /api/projects
│   │   ├── certifications/    # GET /api/certifications
│   │   ├── contact/           # POST /api/contact
│   │   └── admin/             # Protected admin routes
│   │       ├── projects/      # CRUD for projects
│   │       ├── certifications/# CRUD for certifications
│   │       └── contact/       # View contact messages
│   ├── dashboard/             # Admin dashboard UI
│   └── login/                 # Login page
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── auth.ts                # Auth utilities (JWT, bcrypt)
│   └── validators.ts          # Zod validation schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── middleware.ts              # Route protection & CORS
└── .env                       # Environment variables
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase account recommended)
- npm or pnpm

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured for production:

```env
DATABASE_URL="postgresql://postgres.bqoozzswhylbfbgxcdfm:..."
JWT_SECRET="dORCxU8Je42WJqPe5m5Fz2wxpTlz+FIVI+..."
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://admin.alecam.dev"
NEXT_PUBLIC_FRONTEND_URL="https://alecam.dev"
SUPABASE_URL="https://bqoozzswhylbfbgxcdfm.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

⚠️ **Security**: Never commit `.env` to version control. Make sure it's in `.gitignore`.

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with admin user
npm run seed
```

**Default admin credentials:**
- Email: `admin@alecam.dev`
- Password: `admin123456`

⚠️ **Change this password immediately after first login!**

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- Dashboard: http://localhost:3000/dashboard
- Login: http://localhost:3000/login
- API: http://localhost:3000/api

## 📡 API Endpoints

### Public Endpoints (CORS enabled)

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects?featured=true` - Get featured projects only
- `GET /api/projects/[id]` - Get single project

#### Certifications
- `GET /api/certifications` - Get all certifications
- `GET /api/certifications?featured=true` - Get featured certifications only
- `GET /api/certifications/[id]` - Get single certification

#### Contact
- `POST /api/contact` - Submit contact message
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question",
    "message": "Your message here"
  }
  ```

### Protected Admin Endpoints (Requires Authentication)

#### Projects
- `GET /api/admin/projects` - List all projects (paginated)
- `POST /api/admin/projects` - Create project
- `GET /api/admin/projects/[id]` - Get project details
- `PATCH /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project

#### Certifications
- `GET /api/admin/certifications` - List all certifications (paginated)
- `POST /api/admin/certifications` - Create certification
- `GET /api/admin/certifications/[id]` - Get certification details
- `PATCH /api/admin/certifications/[id]` - Update certification
- `DELETE /api/admin/certifications/[id]` - Delete certification

#### Contact Messages
- `GET /api/admin/contact` - List contact messages (paginated)
- `GET /api/admin/contact?status=UNREAD` - Filter by status
- `PATCH /api/admin/contact/[id]` - Update message status
- `DELETE /api/admin/contact/[id]` - Delete message

### Authentication
- `POST /api/auth/login` - Login
  ```json
  {
    "email": "admin@alecam.dev",
    "password": "your-password"
  }
  ```
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## 🔒 Security Features

- **HTTP-only Cookies**: Auth tokens stored securely
- **JWT Expiration**: Tokens expire after 7 days
- **Password Hashing**: bcrypt with salt rounds
- **Route Protection**: Middleware guards admin routes
- **Input Validation**: Zod schemas on all inputs
- **CORS**: Restricted to allowed origins

## 🌐 CORS Configuration

The API allows requests from:
- `https://alecam.dev`
- `https://www.alecam.dev`
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)

Update `middleware.ts` to add more origins.

## 📦 Database Models

### User
- id, email, password (hashed), role, timestamps

### Project
- id, title, description, longDescription, technologies, imageUrl, githubUrl, liveUrl, featured, order, timestamps

### Certification
- id, title, issuer, issueDate, expiryDate, credentialId, credentialUrl, imageUrl, description, skills, featured, order, timestamps

### ContactMessage
- id, name, email, subject, message, status, ipAddress, userAgent, timestamps

## 🚀 Deployment to Vercel

> 📘 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**  
> 🔒 **For security checklist, see [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)**

### Quick Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`

### 3. Set Environment Variables

Add these in Vercel project settings → Environment Variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://admin.alecam.dev
NEXT_PUBLIC_FRONTEND_URL=https://alecam.dev
SUPABASE_URL=https://bqoozzswhylbfbgxcdfm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

💡 Copy values from `.env`

### 4. Set Up Custom Domain

1. Go to **Settings** → **Domains**
2. Add `admin.alecam.dev`
3. Update your DNS:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`

### 5. Run Migrations

After deployment, run migrations:

```bash
# Via Vercel CLI
npx prisma migrate deploy
npx prisma db seed

# Or via Supabase SQL Editor
# Copy SQL from prisma/migrations/*/migration.sql
```

### 6. Verify Deployment

- [ ] Visit `https://admin.alecam.dev/api/projects`
- [ ] Test login at `https://admin.alecam.dev/login`
- [ ] Check dashboard at `https://admin.alecam.dev/dashboard`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio (GUI)
npx prisma migrate dev   # Create and apply migration
npx prisma migrate reset # Reset database
npm run seed             # Seed database

# Prisma
npx prisma generate      # Generate Prisma Client
npx prisma db pull       # Pull schema from database
npx prisma db push       # Push schema to database
```

## 🧪 Testing API with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alecam.dev","password":"admin123456"}' \
  -c cookies.txt
```

### Get Projects (Public)
```bash
curl http://localhost:3000/api/projects
```

### Get Admin Projects (Protected)
```bash
curl http://localhost:3000/api/admin/projects \
  -b cookies.txt
```

### Create Project (Protected)
```bash
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "New Project",
    "description": "Project description",
    "technologies": ["React", "TypeScript"],
    "featured": true
  }'
```

## 📝 Frontend Integration

In your Vite frontend (`alecam.dev`), consume the API:

```typescript
// Example: Fetch projects
const response = await fetch('https://admin.alecam.dev/api/projects');
const { projects } = await response.json();

// Example: Submit contact form
const response = await fetch('https://admin.alecam.dev/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  })
});
```

## 🛡️ Production Checklist

> 📋 **Complete checklist:** [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

**Essential pre-deployment tasks:**
- [ ] Change default admin password
- [ ] Update JWT_SECRET with secure random value (`openssl rand -base64 32`)
- [ ] Configure DATABASE_URL with Supabase production pooler URL
- [ ] Set up custom domains (admin.alecam.dev)
- [ ] Update CORS origins in next.config.ts
- [ ] Run database migrations and seed
- [ ] Test all API endpoints
- [ ] Verify HTTPS and SSL certificates
- [ ] Set up monitoring (Vercel Analytics, logs)

**Post-deployment verification:**
- [ ] Public API endpoints work (GET /api/projects)
- [ ] Admin login works
- [ ] Dashboard CRUD operations work
- [ ] Frontend integration works (alecam.dev → admin.alecam.dev)
- [ ] No CORS errors
- [ ] No console errors

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment guide.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🐛 Troubleshooting

### Prisma Client not found
```bash
npx prisma generate
```

### Migration fails
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### CORS errors
- Check `middleware.ts` allowed origins
- Verify frontend URL is correct
- Check browser console for specific error

### Authentication not working
- Verify JWT_SECRET is set
- Check cookie settings in browser
- Ensure HTTPS in production

## 📄 License

This project is private and proprietary for alecam.dev.

---

**Built with ❤️ for alecam.dev**


# Skill: API Route Design (Next.js App Router)

## Metadata
- **Name**: `api-design`
- **Version**: 1.0.0
- **Category**: Backend Development
- **Domain**: REST API, Next.js, TypeScript
- **Author**: alecam.dev
- **Project-Specific**: Yes

---

## Description

This skill provides expert guidance for designing and implementing REST API routes in Next.js 15+ using the App Router. It enforces the alecam.dev architecture patterns including:

- Route Handler patterns
- Zod validation
- JWT authentication
- Error handling
- Response formatting
- Security best practices

This is a **production-focused** skill that ensures consistency across all API endpoints.

---

## When to Use This Skill

**The agent should invoke this skill when:**
- User asks to create a new API endpoint
- User mentions "route handler", "API route", "/api/*"
- User needs to implement CRUD operations
- User asks about request validation
- User mentions authentication/authorization
- User asks "how do I create an endpoint?"

**Examples of trigger phrases:**
- "Create an API endpoint for user settings"
- "I need a route to fetch all projects"
- "How do I validate the request body?"
- "Add authentication to this endpoint"
- "Create a CRUD API for certifications"

---

## Skill Triggers

```regex
(create|add|build).*(endpoint|route|api)
(API|endpoint).*(design|pattern|structure)
how.*(create|build).*(route|endpoint)
(GET|POST|PUT|DELETE|PATCH).*\/api\/
validate.*(request|body|params)
protect.*(route|endpoint|API)
```

---

## API Design Patterns

### 1. File Structure

```
/app/api
  /resource            # Public endpoints
    route.ts          → GET /api/resource (list)
    [id]/
      route.ts        → GET /api/resource/:id (get by ID)
  
  /admin/resource     # Protected endpoints
    route.ts          → POST /api/admin/resource (create)
    [id]/
      route.ts        → PUT/DELETE /api/admin/resource/:id
```

**Rule**: Public endpoints in `/api/`, admin endpoints in `/api/admin/`

---

### 2. Route Handler Template

#### Public GET Endpoint (List All)

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Optional: query parameters for filtering
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');

    const projects = await db.project.findMany({
      where: featured ? { featured: featured === 'true' } : undefined,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        tech: true,
        featured: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, data: projects },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] GET /api/projects - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
```

#### Public GET by ID

```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await db.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API] GET /api/projects/${params.id} - Error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
```

#### Protected POST Endpoint (Create)

```typescript
// app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { createProjectSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    // 3. Create resource
    const project = await db.project.create({
      data: result.data,
    });

    // 4. Return success
    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/admin/projects - Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
```

#### Protected PUT Endpoint (Update)

```typescript
// app/api/admin/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { updateProjectSchema } from '@/lib/validators';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const result = updateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    // 3. Check if resource exists
    const existing = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 4. Update resource
    const project = await db.project.update({
      where: { id: params.id },
      data: result.data,
    });

    return NextResponse.json(
      { success: true, data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API] PUT /api/admin/projects/${params.id} - Error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
```

#### Protected DELETE Endpoint

```typescript
// app/api/admin/projects/[id]/route.ts
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2. Check if resource exists
    const existing = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 3. Delete resource
    await db.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true, data: { message: 'Project deleted successfully' } },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API] DELETE /api/admin/projects/${params.id} - Error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
```

---

### 3. Validation Schemas (Zod)

**Always define in `/lib/validators.ts`**

```typescript
// lib/validators.ts
import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  tech: z.array(z.string()).min(1, 'At least one technology is required'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createContactMessageSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
```

---

### 4. Response Format Standards

**Success Response:**
```typescript
{
  success: true,
  data: T // The actual data
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string, // User-friendly message
  details?: any[] // Validation errors, optional
}
```

**Status Codes:**
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Unexpected errors

---

### 5. Error Handling Pattern

```typescript
try {
  // Route logic
} catch (error) {
  console.error('[API] METHOD /api/path - Error:', error);
  
  // Never expose stack traces in production
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', error);
  }
  
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

### 6. Authentication Helper

**Extract this into a reusable function:**

```typescript
// lib/auth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

export async function authenticateAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  
  if (!token) {
    return { authenticated: false, error: 'Unauthorized', status: 401 };
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload || payload.role !== 'ADMIN') {
      return { authenticated: false, error: 'Forbidden', status: 403 };
    }

    return { authenticated: true, user: payload };
  } catch {
    return { authenticated: false, error: 'Invalid token', status: 401 };
  }
}
```

**Usage:**
```typescript
export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  // Continue with authenticated logic
}
```

---

## Best Practices Checklist

### ✅ Required for Every Endpoint

- [ ] Proper HTTP method (GET, POST, PUT, DELETE)
- [ ] Try/catch error handling
- [ ] Structured response format (`{ success, data/error }`)
- [ ] Appropriate status codes
- [ ] Logging with context (`[API] METHOD /path`)
- [ ] Type safety (TypeScript types)
- [ ] No stack trace exposure in production

### ✅ For Protected Endpoints

- [ ] Token verification
- [ ] Role checking (ADMIN)
- [ ] Return 401/403 for auth failures

### ✅ For POST/PUT Endpoints

- [ ] Zod validation
- [ ] Return validation errors in structured format
- [ ] Sanitize input (Zod handles this)

### ✅ For GET Endpoints

- [ ] Use Prisma `select` to avoid overfetching
- [ ] Consider pagination for large datasets
- [ ] Support filtering via query parameters

### ✅ For DELETE Endpoints

- [ ] Check if resource exists first
- [ ] Return 404 if not found
- [ ] Consider soft deletes for important data

---

## Common Mistakes to Avoid

### ❌ Don't Do This

**1. Mixing authentication logic in every route**
```typescript
// BAD: Duplicated auth code
export async function POST(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) { /* ... */ }
  const payload = verifyToken(token);
  // ...
}
```
**✅ Do This:** Use the `authenticateAdmin` helper

**2. Exposing raw errors**
```typescript
// BAD: Exposes implementation details
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```
**✅ Do This:** Return generic error message, log details

**3. Not validating input**
```typescript
// BAD: Trusting user input
const body = await req.json();
await db.project.create({ data: body }); // Dangerous!
```
**✅ Do This:** Always use Zod validation

**4. Inconsistent response format**
```typescript
// BAD: Different formats
return NextResponse.json({ project }); // Missing success field
return NextResponse.json({ data: project }); // Missing success field
```
**✅ Do This:** Always use `{ success: true/false, data/error }`

**5. Poor error messages**
```typescript
// BAD: Not helpful
{ error: 'Error' }
```
**✅ Do This:** Be specific
```typescript
{ error: 'Project not found', details: { id: '123' } }
```

---

## Security Checklist

- [ ] Never trust user input - always validate
- [ ] Use parameterized queries (Prisma does this)
- [ ] Verify JWT tokens for protected routes
- [ ] Check user role/permissions
- [ ] Sanitize output (no sensitive fields)
- [ ] Set proper CORS headers
- [ ] Rate limit sensitive endpoints (future enhancement)
- [ ] Use HTTPS in production (Vercel handles this)
- [ ] No credentials in logs
- [ ] No stack traces in production responses

---

## Testing Strategy

### Manual Testing with curl

**Create a project:**
```bash
curl -X POST https://admin.alecam.dev/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Project",
    "description": "A test project",
    "tech": ["React", "TypeScript"],
    "featured": false,
    "order": 1
  }'
```

**Get all projects:**
```bash
curl https://admin.alecam.dev/api/projects
```

**Get project by ID:**
```bash
curl https://admin.alecam.dev/api/projects/uuid-here
```

**Update project:**
```bash
curl -X PUT https://admin.alecam.dev/api/admin/projects/uuid-here \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{ "title": "Updated Title" }'
```

**Delete project:**
```bash
curl -X DELETE https://admin.alecam.dev/api/admin/projects/uuid-here \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## Integration with Agent

### Invocation Example

When a user says:
> "I need to create an API endpoint to fetch user settings"

The agent should respond:

```
I'll help you create a REST API endpoint for user settings following our architecture patterns.

[Agent] Invoking skill: api-design
[Agent] Reason: User needs to create a new API endpoint

**Analysis:**
- Endpoint: GET /api/settings (if public) or GET /api/admin/settings (if protected)
- Method: GET (read operation)
- Authentication: Required (user-specific data)
- Validation: None needed for GET (optional query params)

**Implementation:**
[Code using the templates above]

**Files to create/modify:**
1. `app/api/settings/route.ts` - Route handler
2. `lib/validators.ts` - Add settings schema (if needed)
3. `prisma/schema.prisma` - Add Settings model (if not exists)

**Testing:**
[curl commands for testing]

**Next Steps:**
1. Run `npm run dev` to test locally
2. Test with curl or Postman
3. Verify response format matches standards
4. Add to API documentation

Need help with any of these steps?
```

---

## Quick Reference

### File Locations
- Route handlers: `/app/api/**`
- Validation: `/lib/validators.ts`
- Auth utilities: `/lib/auth.ts`
- DB client: `/lib/db.ts`

### Common Imports
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, authenticateAdmin } from '@/lib/auth';
import { yourSchema } from '@/lib/validators';
```

### Standard Response
```typescript
return NextResponse.json(
  { success: true|false, data|error: ... },
  { status: number }
);
```

---

## Related Skills

- `prd-writing`: For initial feature planning
- `database-schema-design`: For data modeling
- `testing-strategy`: For comprehensive test plans

---

## Version History

- **1.0.0** (2026-02-17): Initial skill definition

---

**Usage Reminder for Agent:**
When you invoke this skill:
1. Analyze the user's request (GET/POST/PUT/DELETE? Public/Protected?)
2. Choose the appropriate template
3. Customize for the specific resource
4. Include testing commands
5. Explain what files need to be created/modified
6. Provide clear next steps

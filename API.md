# API Documentation

Complete API reference for the alecam.dev Admin + API system.

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://admin.alecam.dev`

## Authentication

Most admin endpoints require authentication via JWT token stored in HTTP-only cookies.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@alecam.dev",
  "password": "your-password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "admin@alecam.dev",
    "role": "ADMIN"
  }
}
```

### Logout

```http
POST /api/auth/logout
```

### Get Current User

```http
GET /api/auth/me
```

---

## Public Endpoints

These endpoints are publicly accessible and CORS-enabled for your frontend.

### Projects

#### Get All Projects

```http
GET /api/projects
GET /api/projects?featured=true
```

**Response:**
```json
{
  "projects": [
    {
      "id": "project_id",
      "title": "Project Title",
      "description": "Short description",
      "longDescription": "Detailed description",
      "technologies": ["React", "TypeScript", "Tailwind"],
      "imageUrl": "https://...",
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://...",
      "featured": true,
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Project

```http
GET /api/projects/{id}
```

**Response:**
```json
{
  "project": {
    "id": "project_id",
    "title": "Project Title",
    ...
  }
}
```

### Certifications

#### Get All Certifications

```http
GET /api/certifications
GET /api/certifications?featured=true
```

**Response:**
```json
{
  "certifications": [
    {
      "id": "cert_id",
      "title": "Certification Name",
      "issuer": "Issuing Organization",
      "issueDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": null,
      "credentialId": "CERT-12345",
      "credentialUrl": "https://...",
      "imageUrl": "https://...",
      "description": "Description",
      "skills": ["Skill1", "Skill2"],
      "featured": true,
      "order": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Certification

```http
GET /api/certifications/{id}
```

### Contact

#### Submit Contact Message

```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about your work",
  "message": "I'd like to discuss a potential project..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully",
  "id": "message_id"
}
```

---

## Admin Endpoints

These endpoints require authentication. Include the auth token in cookies.

### Projects Management

#### List All Projects (Admin)

```http
GET /api/admin/projects
GET /api/admin/projects?page=1&limit=10
```

**Response:**
```json
{
  "projects": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Create Project

```http
POST /api/admin/projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "longDescription": "Detailed project description",
  "technologies": ["React", "Node.js"],
  "imageUrl": "https://...",
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://...",
  "featured": true,
  "order": 0
}
```

**Response (201 Created):**
```json
{
  "project": {
    "id": "new_project_id",
    ...
  }
}
```

#### Get Project Details (Admin)

```http
GET /api/admin/projects/{id}
```

#### Update Project

```http
PATCH /api/admin/projects/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "featured": false
}
```

**Note:** All fields are optional in PATCH requests.

#### Delete Project

```http
DELETE /api/admin/projects/{id}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

### Certifications Management

#### List All Certifications (Admin)

```http
GET /api/admin/certifications
GET /api/admin/certifications?page=1&limit=10
```

#### Create Certification

```http
POST /api/admin/certifications
Content-Type: application/json

{
  "title": "AWS Certified Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2024-01-01",
  "expiryDate": "2027-01-01",
  "credentialId": "AWS-12345",
  "credentialUrl": "https://...",
  "imageUrl": "https://...",
  "description": "Professional certification",
  "skills": ["AWS", "Cloud Architecture", "DevOps"],
  "featured": true,
  "order": 0
}
```

#### Get Certification Details (Admin)

```http
GET /api/admin/certifications/{id}
```

#### Update Certification

```http
PATCH /api/admin/certifications/{id}
Content-Type: application/json

{
  "featured": false,
  "order": 5
}
```

#### Delete Certification

```http
DELETE /api/admin/certifications/{id}
```

### Contact Messages Management

#### List Contact Messages

```http
GET /api/admin/contact
GET /api/admin/contact?page=1&limit=10
GET /api/admin/contact?status=UNREAD
```

**Status values:** `UNREAD`, `READ`, `ARCHIVED`

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Question",
      "message": "Message content",
      "status": "UNREAD",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

#### Update Message Status

```http
PATCH /api/admin/contact/{id}
Content-Type: application/json

{
  "status": "READ"
}
```

#### Delete Message

```http
DELETE /api/admin/contact/{id}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Validation Rules

### Project

- `title`: Required, max 200 characters
- `description`: Required
- `technologies`: Array, at least 1 item required
- `imageUrl`: Valid URL or empty string
- `githubUrl`: Valid URL or empty string
- `liveUrl`: Valid URL or empty string
- `featured`: Boolean, default false
- `order`: Integer >= 0, default 0

### Certification

- `title`: Required, max 200 characters
- `issuer`: Required, max 200 characters
- `issueDate`: Required, valid date
- `expiryDate`: Optional, valid date
- `skills`: Array of strings
- `featured`: Boolean, default false
- `order`: Integer >= 0, default 0

### Contact Message

- `name`: Required, max 100 characters
- `email`: Required, valid email
- `subject`: Optional, max 200 characters
- `message`: Required, min 10 characters, max 5000 characters

---

## CORS Configuration

The API allows cross-origin requests from:

- `https://alecam.dev`
- `https://www.alecam.dev`
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)

**Allowed Methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

**Allowed Headers:** `Content-Type`, `Authorization`

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production using:

- Vercel Edge Config
- Upstash Redis
- Custom middleware

---

## Example Frontend Integration

### Fetch Projects

```typescript
async function getProjects() {
  const response = await fetch('https://admin.alecam.dev/api/projects');
  const { projects } = await response.json();
  return projects;
}
```

### Submit Contact Form

```typescript
async function submitContact(formData: ContactForm) {
  const response = await fetch('https://admin.alecam.dev/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
}
```

### Admin Login

```typescript
async function login(email: string, password: string) {
  const response = await fetch('https://admin.alecam.dev/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return response.json();
}
```

---

## Testing with cURL

See [README.md](./README.md) for complete cURL examples for testing all endpoints.

---

**Last Updated:** 2024-01-01  
**API Version:** 1.0.0

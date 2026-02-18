# Skill: Database Schema Design (Prisma + PostgreSQL)

## Metadata
- **Name**: `database-schema-design`
- **Version**: 1.0.0
- **Category**: Database, Data Modeling
- **Domain**: Prisma, PostgreSQL, Schema Design
- **Author**: alecam.dev
- **Project-Specific**: Yes

---

## Description

This skill provides expert guidance for designing database schemas using Prisma ORM and PostgreSQL. It follows best practices for:

- Relational data modeling
- Index optimization
- Data integrity constraints
- Migration strategies
- Performance considerations
- Supabase-specific optimizations

This skill integrates with the `supabase-postgres-best-practices` skill for advanced optimizations.

---

## When to Use This Skill

**The agent should invoke this skill when:**
- User asks to create a new database model
- User mentions "Prisma schema", "database model", "migration"
- User needs to add fields to existing models
- User asks about relationships (one-to-many, many-to-many)
- User mentions "index", "unique constraint", "foreign key"
- User asks "how do I model X in the database?"

**Examples of trigger phrases:**
- "Add a new model for user settings"
- "I need to create a table for comments"
- "How do I add a field to the Project model?"
- "Create a many-to-many relationship between users and projects"
- "Should I index this field?"

---

## Skill Triggers

```regex
(create|add|design).*(model|table|schema)
prisma.*(schema|model|migration)
database.*(design|model|structure)
add.*(field|column|attribute)
(one-to-many|many-to-many|relationship)
(index|unique|constraint|foreign.key)
```

---

## Prisma Schema Patterns

### 1. Basic Model Structure

```prisma
model ModelName {
  // Primary Key (always UUID)
  id        String   @id @default(uuid()) @db.Uuid
  
  // Required fields
  name      String   @db.VarChar(255)
  
  // Optional fields
  description String?  @db.Text
  
  // Enums
  status    Status   @default(DRAFT)
  
  // Arrays
  tags      String[]
  
  // JSON fields
  metadata  Json?
  
  // Timestamps (ALWAYS include)
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)
  
  // Indexes
  @@index([fieldName])
  @@unique([email])
  
  // Table name mapping (optional)
  @@map("model_name")
}
```

---

### 2. Field Types Reference

#### String Types
```prisma
name      String   @db.VarChar(255)  // Short text, max length
bio       String   @db.Text          // Long text, unlimited
slug      String   @db.VarChar(100)  // URL-friendly identifier
```

#### Numeric Types
```prisma
age       Int      @db.Integer       // Whole numbers
price     Float    @db.DoublePrecision // Decimals
order     Int      @default(0)       // Sorting
```

#### Boolean
```prisma
isActive  Boolean  @default(true)
featured  Boolean  @default(false)
```

#### Date & Time
```prisma
createdAt DateTime @default(now()) @db.Timestamptz(3)
updatedAt DateTime @updatedAt @db.Timestamptz(3)
publishedAt DateTime? @db.Timestamptz(3)
```

#### Arrays (PostgreSQL-specific)
```prisma
tags      String[]  // Array of strings
skills    String[]  // Array of strings
```

#### JSON (for flexible data)
```prisma
metadata  Json      // Any JSON structure
settings  Json?     // Optional JSON
```

#### UUID (ALWAYS use for IDs)
```prisma
id        String   @id @default(uuid()) @db.Uuid
```

---

### 3. Relationships

#### One-to-Many
```prisma
model User {
  id       String    @id @default(uuid()) @db.Uuid
  email    String    @unique @db.VarChar(255)
  projects Project[] // A user has many projects
}

model Project {
  id        String   @id @default(uuid()) @db.Uuid
  title     String   @db.VarChar(255)
  userId    String   @db.Uuid          // Foreign key
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId]) // Index foreign keys!
}
```

**Rules:**
- Foreign key field: `userId` (camelCase)
- Always add `@@index([userId])`
- Use `onDelete: Cascade` or `onDelete: SetNull` appropriately

#### Many-to-Many
```prisma
model Project {
  id    String @id @default(uuid()) @db.Uuid
  title String @db.VarChar(255)
  tags  ProjectTag[]
}

model Tag {
  id       String @id @default(uuid()) @db.Uuid
  name     String @unique @db.VarChar(100)
  projects ProjectTag[]
}

model ProjectTag {
  id        String   @id @default(uuid()) @db.Uuid
  projectId String   @db.Uuid
  tagId     String   @db.Uuid
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  
  @@unique([projectId, tagId]) // Prevent duplicates
  @@index([projectId])
  @@index([tagId])
}
```

**Rules:**
- Explicit junction table (don't use implicit `@relation` syntax)
- Always include `@@unique([field1, field2])` to prevent duplicates
- Index both foreign keys

#### One-to-One
```prisma
model User {
  id      String   @id @default(uuid()) @db.Uuid
  email   String   @unique @db.VarChar(255)
  profile Profile?
}

model Profile {
  id     String @id @default(uuid()) @db.Uuid
  bio    String @db.Text
  userId String @unique @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 4. Enums

```prisma
enum Role {
  ADMIN
  USER
  GUEST
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id   String @id @default(uuid()) @db.Uuid
  role Role   @default(USER)
}
```

**Rules:**
- Use SCREAMING_SNAKE_CASE for enum values
- Define enums at schema level
- Always provide a sensible default

---

### 5. Indexes & Constraints

#### Single Field Index
```prisma
model User {
  email String @unique @db.VarChar(255)
  
  @@index([email])
}
```

#### Composite Index
```prisma
model Project {
  userId   String  @db.Uuid
  featured Boolean @default(false)
  order    Int     @default(0)
  
  @@index([userId, featured]) // For filtering by user + featured
  @@index([featured, order])  // For sorting featured projects
}
```

#### Unique Constraint
```prisma
model Project {
  slug String @unique @db.VarChar(100)
  
  @@unique([userId, slug]) // Unique per user
}
```

**When to Add Indexes:**
- ✅ Foreign keys (always)
- ✅ Fields used in WHERE clauses
- ✅ Fields used in ORDER BY
- ✅ Fields used for uniqueness
- ❌ Small tables (< 1000 rows)
- ❌ Fields rarely queried

---

### 6. Defaults & Auto-Generated Values

```prisma
model Project {
  id        String   @id @default(uuid()) @db.Uuid
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)
  order     Int      @default(0)
  featured  Boolean  @default(false)
  status    Status   @default(DRAFT)
}
```

**Rules:**
- Always use `@default(uuid())` for IDs
- Always include `createdAt` and `updatedAt`
- Use `@updatedAt` for automatic updates
- Provide sensible defaults for boolean/enum fields

---

### 7. Soft Deletes (Optional)

```prisma
model Project {
  id        String    @id @default(uuid()) @db.Uuid
  title     String    @db.VarChar(255)
  deletedAt DateTime? @db.Timestamptz(3)
  
  @@index([deletedAt]) // For filtering non-deleted
}
```

**Usage:**
```typescript
// Soft delete
await db.project.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Query only non-deleted
await db.project.findMany({
  where: { deletedAt: null },
});
```

---

## Best Practices Checklist

### ✅ Required for Every Model

- [ ] UUID primary key: `id String @id @default(uuid()) @db.Uuid`
- [ ] Timestamps: `createdAt` and `updatedAt`
- [ ] Proper field types with `@db.*` annotations
- [ ] Indexes on foreign keys
- [ ] Unique constraints where needed
- [ ] Sensible defaults for required fields

### ✅ For Production

- [ ] No breaking changes in migrations (add fields as optional first)
- [ ] Test migrations in development before production
- [ ] Backup database before major schema changes
- [ ] Consider data migration scripts for complex changes

### ✅ For Performance

- [ ] Index fields used in WHERE/ORDER BY
- [ ] Use composite indexes for common query patterns
- [ ] Avoid indexing every field (overhead)
- [ ] Use `select` in queries to avoid fetching unused fields

---

## Migration Workflow

### 1. Create Migration

```bash
npx prisma migrate dev --name add_user_settings
```

### 2. Review Generated SQL

```bash
cat prisma/migrations/YYYYMMDDHHMMSS_add_user_settings/migration.sql
```

### 3. Apply to Production

```bash
npx prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## Common Patterns

### User Model
```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255) // Hashed
  role      Role     @default(USER)
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @db.Timestamptz(3)
  
  @@index([email])
  @@map("users")
}

enum Role {
  ADMIN
  USER
}
```

### Content Model (Posts, Projects, etc.)
```prisma
model Project {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(100)
  description String   @db.Text
  tech        String[]
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now()) @db.Timestamptz(3)
  updatedAt   DateTime @updatedAt @db.Timestamptz(3)
  
  @@index([featured, order])
  @@index([slug])
  @@map("projects")
}
```

### Audit/Log Model
```prisma
model AuditLog {
  id        String   @id @default(uuid()) @db.Uuid
  action    String   @db.VarChar(100)  // CREATE, UPDATE, DELETE
  entity    String   @db.VarChar(100)  // Project, User, etc.
  entityId  String   @db.Uuid
  userId    String?  @db.Uuid
  metadata  Json?
  createdAt DateTime @default(now()) @db.Timestamptz(3)
  
  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## Security Considerations

### ✅ DO
- Hash passwords before storing (use bcrypt in application code)
- Use `@unique` for emails and other sensitive identifiers
- Use `onDelete: Cascade` carefully (consider soft deletes)
- Validate data at application level (Zod) before DB insert

### ❌ DON'T
- Store plain-text passwords
- Store sensitive data in JSON fields (hard to query/encrypt)
- Use sequential IDs (use UUID)
- Expose internal IDs in public URLs (use slugs)

---

## Performance Tips

### Avoid N+1 Queries
```typescript
// BAD: N+1 query problem
const users = await db.user.findMany();
for (const user of users) {
  const projects = await db.project.findMany({
    where: { userId: user.id },
  });
}

// GOOD: Use include
const users = await db.user.findMany({
  include: {
    projects: true,
  },
});
```

### Use Select to Limit Fields
```typescript
// BAD: Fetches all fields
const users = await db.user.findMany();

// GOOD: Only fetch needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    role: true,
  },
});
```

### Pagination
```typescript
const projects = await db.project.findMany({
  take: 10,      // Limit
  skip: 20,      // Offset
  orderBy: {
    createdAt: 'desc',
  },
});
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This

**1. Missing timestamps**
```prisma
model Project {
  id    String @id @default(uuid())
  title String
  // Missing createdAt, updatedAt
}
```

**2. No indexes on foreign keys**
```prisma
model Project {
  userId String @db.Uuid
  user   User   @relation(fields: [userId], references: [id])
  // Missing @@index([userId])
}
```

**3. Using Int for IDs**
```prisma
model User {
  id Int @id @default(autoincrement()) // BAD: Use UUID
}
```

**4. No cascade delete**
```prisma
model Project {
  userId String @db.Uuid
  user   User   @relation(fields: [userId], references: [id])
  // Missing onDelete: Cascade or onDelete: SetNull
}
```

**5. Vague field names**
```prisma
model Project {
  data Json // BAD: What data? Be specific
  info String // BAD: What info?
}
```

---

## Testing Schema Changes

### 1. Test Migration Locally
```bash
# Reset database
npx prisma migrate reset

# Run seed
npx prisma db seed
```

### 2. Verify Schema
```bash
npx prisma validate
```

### 3. Inspect Database
```bash
npx prisma studio
```

---

## Integration with Agent

### Invocation Example

When a user says:
> "I need to add a model for blog posts"

The agent should respond:

```
I'll help you design a database model for blog posts using Prisma.

[Agent] Invoking skill: database-schema-design
[Agent] Reason: User needs to create a new database model

**Analysis:**
- Entity: Blog Post
- Fields: title, content, author, tags, published status
- Relationships: Belongs to User (author)
- Indexes: Needed for filtering published posts, searching by author

**Schema Design:**

prisma
model Post {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(100)
  content     String   @db.Text
  excerpt     String?  @db.VarChar(500)
  tags        String[]
  status      PostStatus @default(DRAFT)
  publishedAt DateTime? @db.Timestamptz(3)
  
  // Author relationship
  authorId    String   @db.Uuid
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now()) @db.Timestamptz(3)
  updatedAt   DateTime @updatedAt @db.Timestamptz(3)
  
  // Indexes
  @@index([authorId])
  @@index([status, publishedAt])
  @@index([slug])
  @@map("posts")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}


**Steps to Implement:**
1. Add the schema to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_posts_model`
3. Run `npx prisma generate` to update Prisma Client
4. Update `lib/validators.ts` to add post schemas
5. Create API routes for posts

**Next Steps:**
1. Review the schema
2. Create the migration
3. Test with Prisma Studio
4. Implement API endpoints

Want me to help with the API routes next?
```

---

## Quick Reference

### Common Commands
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate

# Generate Prisma Client
npx prisma generate
```

### Field Type Mapping
- String (short): `String @db.VarChar(255)`
- String (long): `String @db.Text`
- Number: `Int @db.Integer` or `Float @db.DoublePrecision`
- Boolean: `Boolean`
- Date: `DateTime @db.Timestamptz(3)`
- Array: `String[]`
- JSON: `Json`
- ID: `String @id @default(uuid()) @db.Uuid`

---

## Related Skills

- `supabase-postgres-best-practices`: For advanced query optimization
- `api-design`: For implementing CRUD endpoints
- `prd-writing`: For planning data requirements

---

## Version History

- **1.0.0** (2026-02-17): Initial skill definition

---

**Usage Reminder for Agent:**
When you invoke this skill:
1. Analyze the entity being modeled
2. Identify relationships with existing models
3. Choose appropriate field types
4. Add necessary indexes
5. Include timestamps and proper constraints
6. Provide complete migration workflow
7. Explain next steps (API routes, validation, etc.)

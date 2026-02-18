# Skill: PRD Writing (Product Requirements Document)

## Metadata
- **Name**: `prd-writing`
- **Version**: 1.0.0
- **Category**: Documentation
- **Domain**: Product Management, Feature Specification
- **Author**: alecam.dev

---

## Description

This skill helps you write production-grade Product Requirements Documents (PRDs) for new features, APIs, or system components. It follows industry best practices from companies like Google, Amazon, and Meta.

A good PRD:
- Clearly defines the problem and solution
- Specifies requirements without implementation details (initially)
- Includes success metrics and acceptance criteria
- Considers edge cases and failure scenarios
- Provides a foundation for technical design

---

## When to Use This Skill

**The agent should invoke this skill when:**
- User explicitly asks to "write a PRD"
- User says "document this feature"
- User asks "how should I spec this out?"
- User needs to plan a new feature, API, or component
- User mentions: "requirements", "specification", "feature doc"
- User asks: "what should a PRD include?"

**Examples of trigger phrases:**
- "I need to add a new feature for user profiles, can you write a PRD?"
- "How should I document the new authentication flow?"
- "Create a specification for the image upload API"
- "Write a requirements doc for notifications"

---

## Skill Triggers

```regex
(write|create|draft|generate).*PRD
(product|feature|technical).*(requirement|specification|spec)
how.*document.*feature
need.*(requirements|spec|PRD)
```

---

## PRD Template Structure

When this skill is invoked, use the following structure:

### 1. Header
```markdown
# [Feature Name] - Product Requirements Document

**Author**: [Name or Agent]
**Date**: [YYYY-MM-DD]
**Status**: Draft | Review | Approved
**Version**: 1.0
```

### 2. Overview
- **Problem Statement**: What problem are we solving?
- **Goals**: What do we want to achieve?
- **Non-Goals**: What are we explicitly NOT doing?
- **Success Metrics**: How do we measure success?

### 3. Background & Context
- Why now?
- What's the current state?
- Who are the stakeholders?
- Related systems or features

### 4. User Stories
```
As a [role],
I want [capability],
So that [benefit].
```

### 5. Requirements

#### Functional Requirements
- **FR1**: [Requirement]
  - Priority: P0 (Must-have) | P1 (Should-have) | P2 (Nice-to-have)
  - Acceptance Criteria:
    - Given [context], when [action], then [outcome]

#### Non-Functional Requirements
- Performance
- Security
- Scalability
- Accessibility

### 6. API Specifications (if applicable)
```
Endpoint: POST /api/resource
Request Body: { ... }
Response: { ... }
Status Codes: 200, 400, 401, 500
```

### 7. Data Models (if applicable)
```
Table: users
Fields:
  - id: UUID (PK)
  - email: String (unique)
  - ...
```

### 8. Edge Cases & Error Handling
- What happens when X fails?
- How do we handle invalid input?
- What are the error messages?

### 9. Security Considerations
- Authentication required?
- Authorization rules?
- Data sanitization?
- Rate limiting?

### 10. Open Questions
- List unresolved questions
- Areas needing stakeholder input

### 11. Timeline & Dependencies
- Estimated effort
- Blocking dependencies
- Related work

---

## Best Practices

When using this skill, follow these principles:

### ✅ DO
- Start with the problem, not the solution
- Use concrete examples
- Include acceptance criteria for every requirement
- Consider mobile, accessibility, and edge cases
- Specify error handling explicitly
- Include success metrics
- Keep it concise but complete
- Use consistent terminology

### ❌ DON'T
- Prescribe implementation details (initially)
- Assume context - state it explicitly
- Leave edge cases undefined
- Skip error handling
- Use vague language ("should be fast", "user-friendly")
- Mix multiple features in one PRD
- Write for other engineers only (consider all stakeholders)

---

## Example PRD

```markdown
# User Profile API - Product Requirements Document

**Author**: GitHub Copilot Agent
**Date**: 2026-02-17
**Status**: Draft
**Version**: 1.0

## Overview

### Problem Statement
Users of alecam.dev cannot view detailed information about the portfolio owner (skills, bio, social links). The frontend needs an API endpoint to fetch this data.

### Goals
- Provide a public API endpoint to fetch user profile information
- Support future expansion (multiple users, customization)
- Ensure fast response times (< 200ms)

### Non-Goals
- User authentication (public endpoint)
- User registration/editing (admin-only in future)
- Real-time updates

### Success Metrics
- API response time < 200ms (p95)
- 100% uptime during business hours
- Zero data leaks (no sensitive fields exposed)

## User Stories

**As a frontend developer,**
I want to fetch user profile data via API,
So that I can display the portfolio owner's information.

**As a visitor,**
I want to see the portfolio owner's skills and bio,
So that I can learn about their background.

## Requirements

### Functional Requirements

**FR1**: Public GET endpoint returns user profile
- Priority: P0 (Must-have)
- Acceptance Criteria:
  - Given a GET request to `/api/profile`
  - When the request is made without authentication
  - Then return 200 with profile data

**FR2**: Profile includes: name, bio, skills, social links
- Priority: P0 (Must-have)
- Acceptance Criteria:
  - Response includes all required fields
  - Fields match TypeScript interface

**FR3**: Handle missing profile gracefully
- Priority: P0 (Must-have)
- Acceptance Criteria:
  - If no profile exists, return 404
  - Include helpful error message

### Non-Functional Requirements

**NFR1**: Performance
- Response time < 200ms (p95)
- Cache response for 5 minutes

**NFR2**: Security
- No sensitive data exposed (email, internal IDs)
- Rate limit: 100 requests/minute per IP

**NFR3**: Scalability
- Support 1000 concurrent requests
- CDN-cacheable response

## API Specification

### Get User Profile

```http
GET /api/profile
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Alejandro Camera",
    "bio": "Full-stack developer...",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "socialLinks": {
      "github": "https://github.com/...",
      "linkedin": "https://linkedin.com/in/..."
    },
    "avatar": "https://cdn.alecam.dev/avatar.jpg"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Profile not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Data Model

**Table: Profile**
```prisma
model Profile {
  id          String   @id @default(uuid())
  name        String
  bio         String
  skills      String[]
  socialLinks Json
  avatar      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Edge Cases

1. **No profile exists**: Return 404 with clear message
2. **Database is down**: Return 503 Service Unavailable
3. **Invalid data format**: Sanitize before returning
4. **Large bio**: Limit to 500 characters
5. **Too many skills**: Limit to 50 items

## Security Considerations

- ✅ No authentication required (public endpoint)
- ✅ No sensitive data in response
- ✅ Rate limiting enabled
- ✅ Input sanitization (prevent XSS)
- ✅ CORS configured for alecam.dev only

## Open Questions

1. Should we support multiple languages for bio?
2. Do we need versioning (/api/v1/profile)?
3. Should avatar be served directly or via CDN?

## Timeline

- **Estimated Effort**: 2-3 hours
- **Dependencies**: 
  - Prisma schema updated
  - Database migration completed
- **Related Work**: 
  - Admin endpoint to edit profile (future)

## Acceptance Testing

**Test Case 1**: Successful profile fetch
```bash
curl https://admin.alecam.dev/api/profile
# Expected: 200 with profile data
```

**Test Case 2**: Database unavailable
```bash
# Stop database
curl https://admin.alecam.dev/api/profile
# Expected: 503 Service Unavailable
```

**Test Case 3**: Rate limiting
```bash
# Send 101 requests in 1 minute
# Expected: 101st request returns 429 Too Many Requests
```

---

## Approval

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Security Review
- [ ] UX/Design (if applicable)

```

---

## Integration with Agent

### Invocation Example

When a user says:
> "I need to add a feature for users to save favorite projects"

The agent should respond:
```
I'll help you write a PRD for the "Favorite Projects" feature.

[Agent] Invoking skill: prd-writing
[Agent] Reason: User needs to document a new feature

Let me structure this as a Product Requirements Document...

[Generated PRD using the template above]

**Next Steps:**
1. Review the PRD for completeness
2. Share with stakeholders for feedback
3. Once approved, I can help with the technical design and implementation

Would you like me to refine any section?
```

---

## Validation Checklist

Before submitting a PRD, verify:
- [ ] Problem statement is clear and specific
- [ ] Success metrics are measurable
- [ ] All requirements have priorities
- [ ] Edge cases are documented
- [ ] Security considerations are addressed
- [ ] API specs include all status codes
- [ ] Acceptance criteria are testable
- [ ] Open questions are listed
- [ ] Stakeholders are identified

---

## Common Mistakes to Avoid

1. **Too vague**: "The API should be fast" → Specify: "< 200ms p95"
2. **Mixing concerns**: Don't combine multiple features in one PRD
3. **Implementation bias**: Don't prescribe how to build it (initially)
4. **Skipping edge cases**: Always ask "what could go wrong?"
5. **No metrics**: How will you know if it's successful?
6. **Incomplete API specs**: Include all request/response examples
7. **Ignoring security**: Every feature has security implications

---

## Related Skills

- `api-design`: For detailed API implementation
- `database-schema-design`: For data modeling
- `technical-writing`: For RFC-style docs
- `testing-strategy`: For test plan creation

---

## Version History

- **1.0.0** (2026-02-17): Initial skill definition

---

**Usage Reminder for Agent:**
When you invoke this skill, always explain to the user:
1. That you're using the PRD writing skill
2. Why it's appropriate for their request
3. What sections you'll include
4. What they should review/verify after

This helps users understand your decision-making process and builds trust in the agent's capabilities.

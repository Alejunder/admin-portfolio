# Agent Skills - Test Prompts

This document contains test prompts to verify that your GitHub Copilot agent correctly detects and uses the configured skills.

---

## Testing Strategy

### 1. Skill Detection Test
These prompts should trigger specific skills. Monitor the agent's response to verify it:
- Explicitly mentions using the skill
- Logs the skill invocation
- Follows the skill's template/pattern

### 2. Skill Integration Test
These prompts test whether skills work together correctly.

### 3. Edge Case Test
These prompts verify the agent handles ambiguous requests appropriately.

---

## Test Prompts by Skill

### 📝 PRD Writing Skill

#### ✅ Should Trigger

**Test 1: Explicit Request**
```
Write a PRD for a new feature that allows users to bookmark their favorite projects.
```
**Expected:** Agent invokes `prd-writing` skill, creates a comprehensive PRD using the template.

**Test 2: Implicit Request**
```
I want to add a rating system for certifications. How should I document this?
```
**Expected:** Agent suggests creating a PRD and invokes the skill.

**Test 3: Specification Request**
```
Can you help me spec out the requirements for user notifications?
```
**Expected:** Agent uses `prd-writing` skill to create a specification document.

**Test 4: Feature Planning**
```
I need to plan a new API endpoint for analytics. What should I include?
```
**Expected:** Agent creates a PRD-style document with requirements.

#### ❌ Should NOT Trigger

**Test 5: Implementation Request**
```
Implement a bookmark feature for projects.
```
**Expected:** Agent asks if the user wants a PRD first, or proceeds directly to implementation (uses `api-design` or code generation instead).

---

### 🔌 API Design Skill

#### ✅ Should Trigger

**Test 6: Explicit Endpoint Creation**
```
Create an API endpoint to fetch all active certifications.
```
**Expected:** Agent invokes `api-design` skill, creates route handler with proper structure.

**Test 7: CRUD Request**
```
I need CRUD operations for a Comments model.
```
**Expected:** Agent uses `api-design` skill to create all four endpoints (GET, POST, PUT, DELETE).

**Test 8: Protected Endpoint**
```
Add authentication to the /api/projects endpoint.
```
**Expected:** Agent uses `api-design` skill, adds JWT verification pattern.

**Test 9: Validation Question**
```
How should I validate the request body for creating a new project?
```
**Expected:** Agent references `api-design` skill and Zod validation patterns.

**Test 10: Error Handling**
```
What's the correct way to handle errors in API routes?
```
**Expected:** Agent explains error handling pattern from `api-design` skill.

#### ❌ Should NOT Trigger

**Test 11: Frontend Question**
```
How do I display projects on the React frontend?
```
**Expected:** Agent provides React guidance (may use `vercel-react-best-practices` if available).

---

### 🗄️ Database Schema Design Skill

#### ✅ Should Trigger

**Test 12: Model Creation**
```
I need to add a database model for user comments.
```
**Expected:** Agent invokes `database-schema-design` skill, creates Prisma schema.

**Test 13: Field Addition**
```
How do I add a "featured" field to the Certification model?
```
**Expected:** Agent uses `database-schema-design` skill to show proper Prisma syntax and migration steps.

**Test 14: Relationship Question**
```
Create a many-to-many relationship between Projects and Tags.
```
**Expected:** Agent uses `database-schema-design` skill, creates junction table.

**Test 15: Index Question**
```
Should I add an index to the email field in the User model?
```
**Expected:** Agent references `database-schema-design` skill's indexing best practices.

**Test 16: Migration Help**
```
I need to migrate the database to add a new Posts table.
```
**Expected:** Agent uses `database-schema-design` skill, provides schema and migration commands.

#### ❌ Should NOT Trigger

**Test 17: Query Question**
```
How do I fetch all projects ordered by creation date?
```
**Expected:** Agent provides Prisma query code (not schema design).

---

## Multi-Skill Integration Tests

### Test 18: Feature Development Flow
```
I want to add a feature for users to leave reviews on projects. Help me plan and implement this.
```
**Expected:**
1. Agent asks if user wants to start with a PRD
2. Uses `prd-writing` skill to document requirements
3. Uses `database-schema-design` skill for Review model
4. Uses `api-design` skill for endpoints
5. Provides step-by-step implementation plan

### Test 19: Bug Fix Flow
```
The /api/projects endpoint is returning 500 errors. Help me debug and fix it.
```
**Expected:**
1. Agent asks for error details/logs
2. Reviews code (may reference `api-design` patterns)
3. Suggests fixes following best practices
4. Provides testing commands

### Test 20: Refactoring Flow
```
The authentication code is duplicated across multiple routes. How can I refactor it?
```
**Expected:**
1. Agent references `api-design` skill's authentication helper pattern
2. Creates reusable `authenticateAdmin` function
3. Shows how to integrate it into existing routes

---

## Edge Case Tests

### Test 21: Ambiguous Request
```
I need to work on projects.
```
**Expected:** Agent asks clarifying questions:
- "Do you want to create a new project endpoint?"
- "Do you want to modify the Project model?"
- "Do you want to write a PRD for a new project feature?"

### Test 22: Multiple Skills Needed
```
Add a tags system to projects with full CRUD and database support.
```
**Expected:** Agent recognizes need for multiple skills:
1. `database-schema-design` for Tag and junction table
2. `api-design` for CRUD endpoints
3. Provides comprehensive implementation plan

### Test 23: Skill Trigger with Typo
```
Crete an API rout for fetching sertifications.
```
**Expected:** Agent understands intent despite typos, uses `api-design` skill.

### Test 24: No Skill Needed
```
What's the difference between Next.js and React?
```
**Expected:** Agent provides general explanation without invoking specialized skills.

---

## Verification Checklist

When testing, verify the agent:

### ✅ Skill Usage
- [ ] Explicitly logs skill invocation: `[Agent] Invoking skill: skill-name`
- [ ] Explains why the skill was chosen
- [ ] Follows the skill's template/pattern
- [ ] Provides complete output (not truncated or generic)

### ✅ Context Awareness
- [ ] References project-specific patterns (e.g., JWT auth, Prisma singleton)
- [ ] Uses correct file paths (`/app/api/*`, `/lib/*`)
- [ ] Follows TypeScript strict mode
- [ ] Applies Zod validation patterns

### ✅ Response Quality
- [ ] Provides actionable code/steps
- [ ] Includes testing commands
- [ ] Lists next steps
- [ ] Asks clarifying questions when needed
- [ ] Offers alternatives when applicable

### ✅ Error Handling
- [ ] Gracefully handles ambiguous prompts
- [ ] Doesn't hallucinate capabilities
- [ ] Admits when unsure
- [ ] Suggests relevant skills when appropriate

---

## Debugging Failed Tests

If a test fails (skill not triggered):

### 1. Check Skill Definition
```markdown
- Is the SKILL.md file in `.github/skills/{skill-name}/SKILL.md`?
- Does the skill have clear trigger patterns?
- Is the description specific enough?
```

### 2. Check Instructions File
```markdown
- Is it located at `.github/copilot-instructions.md`?
- Does it reference the skills in the "Skills Integration" section?
- Are there clear usage examples?
```

### 3. Rephrase the Prompt
```markdown
Try different phrasings:
- "Create an API endpoint" vs "Add a route handler"
- "Write a PRD" vs "Document requirements"
- "Design a schema" vs "Create a database model"
```

### 4. Check Agent Logs
```markdown
Look for:
- `[Agent Decision]:` logs
- `[Agent] Invoking skill:` messages
- Error messages about missing skills
```

### 5. Verify Folder Structure
```
.github/
  copilot-instructions.md
  skills/
    prd-writing/
      SKILL.md
    api-design/
      SKILL.md
    database-schema-design/
      SKILL.md
```

---

## Advanced Tests

### Test 25: Context Preservation
```
[First message] Create a User Settings API endpoint
[Second message] Now add validation for that endpoint
[Third message] Write tests for it
```
**Expected:** Agent maintains context across messages, references previous responses.

### Test 26: Conflicting Patterns
```
Create a /api/users endpoint but use MongoDB instead of PostgreSQL.
```
**Expected:** Agent should note that the project uses PostgreSQL/Prisma and ask for clarification or refuse the MongoDB suggestion.

### Test 27: Security Testing
```
Create an endpoint to delete any user without authentication.
```
**Expected:** Agent should refuse or strongly warn about security implications, reference authentication patterns.

---

## Recording Test Results

Use this template to track test results:

```markdown
## Test Results - [Date]

| Test # | Prompt Summary | Expected Skill | Result | Notes |
|--------|----------------|----------------|--------|-------|
| 1      | Write PRD for bookmarks | prd-writing | ✅ Pass | Skill invoked correctly |
| 2      | Document rating system | prd-writing | ❌ Fail | Generic response, no skill |
| ...    | ...            | ...            | ...    | ...   |

### Issues Found:
1. Test 2 failed - agent didn't detect implicit PRD request
2. Test 8 - authentication pattern not applied correctly

### Action Items:
- [ ] Improve PRD skill trigger patterns
- [ ] Add more auth examples to api-design skill
```

---

## Continuous Improvement

After testing:
1. **Update skill triggers** if certain phrases aren't detected
2. **Refine skill descriptions** to be more specific
3. **Add examples** to skills based on common requests
4. **Update instructions** to emphasize skill usage
5. **Document edge cases** discovered during testing

---

## Success Criteria

The agent skills system is working correctly when:

- ✅ 80%+ of explicit skill requests trigger the correct skill
- ✅ Agent logs skill invocations clearly
- ✅ Generated code follows project patterns
- ✅ Multi-skill flows work seamlessly
- ✅ Edge cases are handled gracefully
- ✅ Users understand why skills were used

---

**Last Updated:** 2026-02-17
**Next Review:** After 50 prompts or 1 week of usage

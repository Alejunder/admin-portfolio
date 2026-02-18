# Agent Skills Debugging Guide

This guide helps you troubleshoot when GitHub Copilot agents aren't detecting or using skills correctly.

---

## 🔍 Quick Diagnostic

Use this checklist to quickly identify the issue:

### ✅ Folder Structure
```
.github/
  ├── copilot-instructions.md  ← Main agent configuration
  ├── TESTING.md               ← Test prompts
  ├── DEBUGGING.md             ← This file
  └── skills/
      ├── prd-writing/
      │   └── SKILL.md
      ├── api-design/
      │   └── SKILL.md
      └── database-schema-design/
          └── SKILL.md
```

**Check:**
- [ ] Folder is named `.github` (with dot), not `github`
- [ ] All SKILL.md files exist and are not empty
- [ ] copilot-instructions.md is in the `.github` folder
- [ ] File names are exactly as shown (case-sensitive)

### ✅ Agent Configuration
```bash
# Verify files exist
ls .github/
ls .github/skills/
```

**Check:**
- [ ] copilot-instructions.md references skills
- [ ] Skill descriptions are clear and specific
- [ ] Skills Integration section exists

### ✅ Skill Invocation
When you ask the agent a question, it should:
- [ ] Log: `[Agent] Invoking skill: skill-name`
- [ ] Log: `[Agent] Reason: ...`
- [ ] Use the skill's template/pattern
- [ ] Provide comprehensive output

---

## 🚨 Common Issues & Solutions

### Issue 1: Agent Not Using Any Skills

**Symptoms:**
- Agent provides generic answers
- No `[Agent] Invoking skill:` logs
- Doesn't follow project-specific patterns

**Possible Causes:**
1. Skills folder is in wrong location (`github/` instead of `.github/`)
2. copilot-instructions.md not found
3. Skills not enabled in workspace

**Solutions:**

**A. Verify Folder Structure**
```bash
# Should show .github folder
ls -la | grep ".github"

# Should show files
ls .github/
# Expected: copilot-instructions.md, skills/, TESTING.md, DEBUGGING.md
```

**B. Move Files if Needed**
```bash
# If you have github/ instead of .github/
mv github .github
```

**C. Restart VS Code**
```
Close and reopen VS Code to reload agent configuration
```

**D. Check File Contents**
```bash
# Verify copilot-instructions.md exists and has content
cat .github/copilot-instructions.md | head -20
```

---

### Issue 2: Specific Skill Not Triggering

**Symptoms:**
- Agent uses some skills but not others
- A specific skill never gets invoked

**Possible Causes:**
1. SKILL.md file is empty or malformed
2. Skill triggers are too specific
3. Skill description is unclear

**Solutions:**

**A. Verify Skill File**
```bash
# Check if file exists and has content
cat .github/skills/prd-writing/SKILL.md | wc -l
# Should show > 100 lines
```

**B. Improve Skill Triggers**

Edit the SKILL.md file and add more trigger patterns:

```markdown
## Skill Triggers

```regex
# Add multiple variations
(write|create|draft|generate|compose).*PRD
(product|feature|technical).*(requirement|specification|spec|document)
how.*document.*feature
need.*(requirements|spec|PRD)
plan.*(feature|capability|functionality)
```
```

**C. Make Description More Specific**

Bad (too generic):
```markdown
## Description
This skill helps with writing.
```

Good (specific and actionable):
```markdown
## Description
This skill writes production-grade Product Requirements Documents (PRDs) for features, APIs, and system components. Use when the user needs to document requirements, plan features, or create specifications.
```

---

### Issue 3: Agent Uses Wrong Skill

**Symptoms:**
- Agent invokes a skill but it's not the right one
- Multiple skills have overlapping triggers

**Possible Causes:**
1. Skill triggers overlap too much
2. Skill descriptions are ambiguous

**Solutions:**

**A. Refine Skill Boundaries**

Make each skill more specific:

- `prd-writing`: Planning & documentation
- `api-design`: Implementation of API routes
- `database-schema-design`: Data modeling with Prisma

**B. Update Skill Descriptions**

In copilot-instructions.md:
```markdown
**Use `prd-writing` skill when:**
- User asks to "write a PRD" (explicit)
- User needs product specifications
- User wants to PLAN a new feature (before implementation)
- User asks "how should I document this?"

**Use `api-design` skill when:**
- User asks to CREATE/IMPLEMENT an API endpoint
- User mentions route handlers, "/api/*"
- User needs CRUD operations code
- User asks about request validation or authentication
```

---

### Issue 4: Skill Used But Output is Generic

**Symptoms:**
- Agent claims to use a skill
- Output doesn't follow skill template
- Missing project-specific patterns

**Possible Causes:**
1. Skill template is unclear
2. Skill doesn't reference project context
3. Agent not following instructions

**Solutions:**

**A. Strengthen Skill Templates**

In SKILL.md, provide explicit templates:

````markdown
## Template

When this skill is invoked, use this structure:

```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  // [exact code pattern here]
}
```
````

**B. Reference Project Patterns**

In SKILL.md:
```markdown
## Project-Specific Requirements

- Always use `/lib/db.ts` for Prisma client
- Always validate with Zod schemas from `/lib/validators.ts`
- Always use JWT auth from `/lib/auth.ts`
- Always return { success, data/error } format
```

**C. Add Integration Examples**

In SKILL.md:
```markdown
## Integration Example

When user says: "Create an endpoint for user settings"

Agent should respond:
1. Log skill invocation
2. Use exact template from this skill
3. Reference project file structure
4. Provide complete, runnable code
```

---

### Issue 5: Multi-Skill Workflows Fail

**Symptoms:**
- Agent uses first skill correctly
- Doesn't continue with related skills
- Missing comprehensive implementation

**Possible Causes:**
1. Skills don't reference each other
2. copilot-instructions.md doesn't encourage workflow

**Solutions:**

**A. Link Related Skills**

In each SKILL.md:
```markdown
## Related Skills

- `prd-writing`: Start here for feature planning
- `database-schema-design`: Then design the data model
- `api-design`: Finally implement API endpoints
```

**B. Update Instructions**

In copilot-instructions.md:
```markdown
## Workflow Example

For new features:
1. Use `prd-writing` to document requirements
2. Use `database-schema-design` for data model
3. Use `api-design` for endpoints
4. Provide testing strategy

Always ask: "Would you like me to continue with [next step]?"
```

---

### Issue 6: Agent Doesn't Log Skill Usage

**Symptoms:**
- Skills seem to work
- No `[Agent] Invoking skill:` messages

**Possible Causes:**
1. Instructions don't require logging
2. Agent ignores logging directive

**Solutions:**

**A. Strengthen Logging Requirements**

In copilot-instructions.md:
```markdown
## Skill Usage Protocol (MANDATORY)

When you decide to use a skill:
1. **ALWAYS log the decision**: 
   ```
   [Agent] Invoking skill: skill-name
   [Agent] Reason: Explanation here
   ```
2. Use the skill to get expert guidance
3. Apply the guidance to user's context
4. Explain what you did
```

**B. Add to Each Skill**

In SKILL.md:
```markdown
**Usage Reminder for Agent:**
ALWAYS log when you use this skill:
[Agent] Invoking skill: skill-name
[Agent] Reason: Why you're using it
```

---

## 🧪 Testing Methodology

### 1. Isolated Skill Test

Test each skill independently:

```markdown
Test: "Write a PRD for user profiles"
Expected: prd-writing skill invoked

Test: "Create a GET endpoint for /api/users"
Expected: api-design skill invoked

Test: "Add a Comments model to the database"
Expected: database-schema-design skill invoked
```

### 2. Multi-Skill Test

Test workflows:

```markdown
Test: "I want to add a ratings feature. Help me plan and implement it."
Expected:
1. prd-writing skill for requirements
2. database-schema-design for Rating model
3. api-design for endpoints
4. Clear workflow explanation
```

### 3. Edge Case Test

Test ambiguous requests:

```markdown
Test: "I need help with projects"
Expected: Agent asks clarifying questions

Test: "Create a feature" (no details)
Expected: Agent asks what kind of feature
```

---

## 📊 Debugging Workflow

Follow this process when skills aren't working:

### Step 1: Verify Installation
```bash
# Check folder structure
ls -la .github/
ls -la .github/skills/

# Check file contents
cat .github/copilot-instructions.md | head -20
cat .github/skills/prd-writing/SKILL.md | head -20
```

### Step 2: Test Simple Prompt
```
Prompt: "Write a PRD for user authentication"
Expected: Should trigger prd-writing skill
```

### Step 3: Check Agent Response
Look for:
- [ ] `[Agent] Invoking skill:` message
- [ ] Follows PRD template
- [ ] Includes all PRD sections

### Step 4: Increase Specificity
If test fails, try more explicit:
```
Prompt: "Use the prd-writing skill to create a PRD for user authentication"
```

### Step 5: Review Skill File
If still fails:
```bash
# Ensure file is not empty
cat .github/skills/prd-writing/SKILL.md | wc -l

# Check for required sections
grep "## Description" .github/skills/prd-writing/SKILL.md
grep "## When to Use" .github/skills/prd-writing/SKILL.md
grep "## Template" .github/skills/prd-writing/SKILL.md
```

### Step 6: Simplify & Rebuild
If all else fails:
1. Create minimal SKILL.md with just description
2. Test if it triggers
3. Gradually add sections back
4. Identify what breaks it

---

## 🔬 Advanced Debugging

### Enable Verbose Logging

Add to copilot-instructions.md:

```markdown
## Debug Mode

When you make ANY decision, log it:
- [Agent Decision]: What you're doing
- [Agent Skill Check]: Which skills you considered
- [Agent Skill Selected]: Which skill you chose and why
- [Agent Context]: What information influenced your decision
```

### Test with Minimal Example

Create a minimal test skill:

```markdown
# .github/skills/test-skill/SKILL.md

# Skill: Test

Use this skill when the user says "test skill".

## Template

When invoked, respond with: "Test skill successfully invoked!"
```

Test:
```
Prompt: "test skill"
Expected: Agent responds with exact message
```

### Compare With Working Example

If some skills work and others don't:
1. Compare SKILL.md structure
2. Check file sizes
3. Look for syntax errors (unclosed code blocks, etc.)
4. Use diff tool: `diff working-skill.md broken-skill.md`

---

## 🛠️ Maintenance Checklist

Perform weekly:

- [ ] Test all skills with standard prompts
- [ ] Review agent responses for accuracy
- [ ] Update skill triggers based on failed tests
- [ ] Add new examples to skills
- [ ] Clean up unused/redundant patterns
- [ ] Document new edge cases discovered

Perform monthly:

- [ ] Review skill usage analytics (if available)
- [ ] Identify most/least used skills
- [ ] Consolidate or split skills as needed
- [ ] Update copilot-instructions.md with learnings
- [ ] Test all multi-skill workflows

---

## 📋 Issue Template

When reporting skill issues, use this template:

```markdown
## Skill Issue Report

**Date:** YYYY-MM-DD
**Skill:** skill-name
**Issue:** Brief description

### Prompt Used:
```
[exact prompt here]
```

### Expected Behavior:
- Should invoke [skill-name]
- Should provide [specific output]

### Actual Behavior:
- Did not invoke skill / Invoked wrong skill
- Provided generic response

### Environment:
- VS Code Version: X.Y.Z
- Copilot Extension Version: X.Y.Z
- Workspace: [project name]

### Files Checked:
- [ ] .github/copilot-instructions.md exists
- [ ] .github/skills/[skill]/SKILL.md exists
- [ ] File structure is correct

### Attempted Solutions:
1. [what you tried]
2. [result]

### Additional Notes:
[any other relevant information]
```

---

## 🎯 Success Indicators

You know skills are working when:

✅ **Agent consistently logs skill usage**
```
[Agent] Invoking skill: prd-writing
[Agent] Reason: User requested feature documentation
```

✅ **Agent follows templates exactly**
- PRD includes all sections
- API code uses project patterns
- Schema includes proper indexes

✅ **Agent explains decisions**
- "I'm using the prd-writing skill because..."
- "This triggers the api-design skill due to..."

✅ **Multi-skill workflows work smoothly**
- PRD → Schema → API → Tests
- Agent suggests next steps
- Maintains context across messages

✅ **Test prompts pass 80%+ of the time**
- See TESTING.md for test suite
- Document failures and patterns

---

## 📞 Escalation Path

If you've tried everything and skills still don't work:

1. **Check GitHub Copilot Status**: https://www.githubstatus.com/
2. **Review Copilot Agents Documentation**: Ensure you're following latest best practices
3. **Simplify to minimal example**: Single skill, single prompt
4. **Check VS Code extensions**: Disable other AI extensions temporarily
5. **Reinstall Copilot extension**: Sometimes helps with configuration issues

---

## 📚 Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Agent Skills Best Practices](https://github.com/features/copilot/skills)
- [Workspace Configuration Guide](https://code.visualstudio.com/docs/copilot/copilot-customization)
- Project-specific: See `.github/copilot-instructions.md`

---

**Last Updated:** 2026-02-17
**Maintainer:** alecam.dev team
**Next Review:** After 100 prompts or significant changes

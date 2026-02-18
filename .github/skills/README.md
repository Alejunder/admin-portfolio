# GitHub Copilot Agent Skills

This folder contains domain-specific skills for the GitHub Copilot agent used in the alecam.dev project.

---

## 📚 Available Skills

### 1. PRD Writing (`prd-writing`)
**Purpose:** Create production-grade Product Requirements Documents

**Use When:**
- Planning new features
- Documenting specifications
- Creating technical requirements

**Triggers:**
- "Write a PRD for..."
- "Document the requirements for..."
- "Create a specification for..."

**Location:** `.github/skills/prd-writing/SKILL.md`

---

### 2. API Design (`api-design`)
**Purpose:** Design and implement REST API endpoints in Next.js

**Use When:**
- Creating new API routes
- Implementing CRUD operations
- Adding authentication to endpoints
- Validating request bodies

**Triggers:**
- "Create an API endpoint..."
- "Add a route handler..."
- "Implement CRUD for..."
- "Protect this endpoint..."

**Location:** `.github/skills/api-design/SKILL.md`

---

### 3. Database Schema Design (`database-schema-design`)
**Purpose:** Design database models using Prisma ORM

**Use When:**
- Creating new database models
- Adding fields to existing models
- Defining relationships
- Creating migrations

**Triggers:**
- "Add a database model..."
- "Create a Prisma schema..."
- "Add a field to..."
- "Create a relationship between..."

**Location:** `.github/skills/database-schema-design/SKILL.md`

---

## 🎯 How It Works

### 1. Agent Detects Intent
When you ask a question, the Copilot agent analyzes your request against skill trigger patterns.

### 2. Skill Invocation
If a match is found, the agent logs:
```
[Agent] Invoking skill: skill-name
[Agent] Reason: Explanation of why
```

### 3. Template Application
The agent applies the skill's template and best practices to generate the response.

### 4. Contextual Output
The response follows project-specific patterns (JWT auth, Prisma, Zod validation, etc.).

---

## 🚀 Quick Start

### Test the Skills

Try these prompts:

**Test PRD Writing:**
```
Write a PRD for a user profile feature
```

**Test API Design:**
```
Create a GET endpoint for /api/certifications
```

**Test Database Schema:**
```
Add a Comments model to the database
```

---

## 📁 Folder Structure

```
.github/
├── copilot-instructions.md          # Main agent configuration
├── TESTING.md                        # Test prompts & verification
├── DEBUGGING.md                      # Troubleshooting guide
├── README.md                         # This file
└── skills/
    ├── prd-writing/
    │   └── SKILL.md                  # PRD writing skill definition
    ├── api-design/
    │   └── SKILL.md                  # API design skill definition
    └── database-schema-design/
        └── SKILL.md                  # Database schema skill definition
```

---

## 🔧 Configuration

### Main Instructions
The agent's core behavior is defined in:
- `.github/copilot-instructions.md`

This file includes:
- Project context and architecture
- Tech stack requirements
- Coding standards
- Skill integration instructions

### Skill Files
Each skill is defined in its own `SKILL.md` file with:
- Description and purpose
- Trigger patterns
- Templates and examples
- Best practices
- Integration instructions

---

## ✅ Testing

### Run Test Suite
See `.github/TESTING.md` for:
- 27 comprehensive test prompts
- Expected behaviors
- Multi-skill workflow tests
- Edge case scenarios

### Quick Verification
```bash
# Check all files exist
ls .github/skills/*/SKILL.md

# Should output:
# .github/skills/api-design/SKILL.md
# .github/skills/database-schema-design/SKILL.md
# .github/skills/prd-writing/SKILL.md
```

---

## 🐛 Debugging

If skills aren't working, see `.github/DEBUGGING.md` for:
- Common issues and solutions
- Diagnostic checklist
- Step-by-step troubleshooting
- Testing methodology

### Quick Fixes

**Skills not triggering?**
1. Verify folder is `.github` (with dot), not `github`
2. Restart VS Code
3. Check copilot-instructions.md references skills

**Wrong skill invoked?**
1. Make prompts more specific
2. Review skill trigger patterns
3. Update skill boundaries

---

## 📖 Writing New Skills

### Skill Template

```markdown
# Skill: [Skill Name]

## Metadata
- **Name**: `skill-name`
- **Version**: 1.0.0
- **Category**: [Category]
- **Domain**: [Domain]

## Description
[Clear description of what the skill does]

## When to Use This Skill
[Explicit triggers and use cases]

## Skill Triggers
```regex
[Regular expressions for detection]
```

## [Skill Name] Template
[Detailed templates, patterns, and examples]

## Best Practices
[Do's and don'ts]

## Integration with Agent
[Example of how agent should use this skill]
```

### Best Practices for Skills

**✅ DO:**
- Be specific and actionable
- Include comprehensive examples
- Reference project context
- Provide templates
- Explain when to use
- Include anti-patterns

**❌ DON'T:**
- Create overlapping skills
- Use vague descriptions
- Omit examples
- Ignore project context
- Create skills without clear triggers

---

## 🔄 Maintenance

### Weekly
- Test all skills with standard prompts
- Document any issues
- Update trigger patterns as needed

### Monthly
- Review skill usage
- Add new examples based on common requests
- Refactor overlapping skills
- Update documentation

### When Adding Features
1. Update relevant skills
2. Add test prompts
3. Verify skills work with new patterns

---

## 🎓 Learning Resources

### For Developers
- Read `.github/copilot-instructions.md` for project context
- Review `SKILL.md` files for patterns
- Use `TESTING.md` to verify understanding
- Reference `DEBUGGING.md` when stuck

### For Agent Development
- Study trigger patterns
- Understand template structure
- Learn skill boundaries
- Practice multi-skill workflows

---

## 📊 Skill Usage Examples

### Scenario 1: New Feature Development
```
User: "I want to add a comments feature to projects"

Agent Flow:
1. [prd-writing] Create PRD with requirements
2. [database-schema-design] Design Comment model
3. [api-design] Implement CRUD endpoints
4. Provide testing strategy
```

### Scenario 2: Bug Fix
```
User: "The /api/projects endpoint returns 500"

Agent Flow:
1. Review code
2. [api-design] Reference error handling pattern
3. Suggest fix
4. Provide testing commands
```

### Scenario 3: Refactoring
```
User: "Refactor authentication code"

Agent Flow:
1. [api-design] Use authenticateAdmin pattern
2. Show refactored code
3. Update all affected routes
4. Verify tests pass
```

---

## 🤝 Contributing

### Adding a New Skill
1. Create folder: `.github/skills/[skill-name]/`
2. Create `SKILL.md` using template above
3. Update this README with skill info
4. Add test prompts to `TESTING.md`
5. Test thoroughly
6. Document in copilot-instructions.md

### Improving Existing Skills
1. Identify issue or enhancement
2. Update `SKILL.md`
3. Add test cases
4. Verify no regressions
5. Update documentation

---

## 📞 Support

**Issues with skills?**
1. Check `DEBUGGING.md` first
2. Verify folder structure
3. Test with simple prompts
4. Review skill definitions

**Want to add external skills?**
```bash
# Example: Add Supabase best practices skill
npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices
```

**Need help?**
- Review project documentation
- Check GitHub Copilot docs
- Test with minimal examples

---

## 📈 Success Metrics

Skills are working well when:
- ✅ 80%+ test prompts pass
- ✅ Agent logs skill usage consistently
- ✅ Generated code follows project patterns
- ✅ Users understand skill invocations
- ✅ Multi-skill workflows succeed

---

## 🔮 Future Enhancements

Planned skills:
- [ ] `testing-strategy`: Create comprehensive test plans
- [ ] `deployment`: Deploy to Vercel with best practices
- [ ] `security-audit`: Review code for security issues
- [ ] `performance-optimization`: Optimize queries and API routes
- [ ] `documentation`: Generate API documentation

---

## 📝 Version History

- **1.0.0** (2026-02-17): Initial skill system setup
  - Added prd-writing skill
  - Added api-design skill
  - Added database-schema-design skill
  - Created testing and debugging guides

---

**Maintained by:** alecam.dev
**Last Updated:** 2026-02-17
**Next Review:** After 50 agent interactions

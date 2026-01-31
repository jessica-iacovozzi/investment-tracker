# Rule 5: Full Application Development

## Goal

Guide users from empty folder to production-ready application as a senior software architect. Collaborate on technology choices, initialize project, then use Rules 1-4 for feature development.

## Philosophy

- **Pragmatic over trendy:** Mature, battle-tested tech over bleeding-edge
- **Appropriate complexity:** Match solution to requirements
- **Clear reasoning:** Explain trade-offs and recommendations
- **Strategic collaboration:** Guide without dictating

## Process

```
Requirements → Tooling Decision → Project Init → Foundation → Development (Rules 1-4)
```

---

## Phase 1: Requirements Gathering

Ask targeted questions based on app type:

**Application Type:** Web/Mobile/Desktop/CLI/API/Full-Stack

**Key Questions (adapt per type):**
- Scale: Small/Medium/Large/Very Large users
- Complexity: Simple/Medium/Complex/Very Complex
- Real-time needs: None/Updates/Collaboration/Streaming
- Data: Structured/Relational/Document/Mix
- Team: Solo/Small/Growing/Large
- Experience: Beginner/Intermediate/Experienced/Senior
- Language preference: [User specifies]
- Deployment: Cloud/Serverless/VPS/Containers
- Budget: Minimal/Low/Moderate/Enterprise

**Special Requirements:** Auth, payments, email/SMS, file storage, search, i18n, multi-tenancy, compliance, integrations

---

## Phase 2: Technology Stack

Present 2-3 curated options with:
- Stack components (Frontend, Backend, Database, Auth, Deployment)
- Strengths (3 key benefits)
- Trade-offs (2 considerations)
- Recommendation with reasoning tied to requirements

**Selection Principles:** Maturity (3+ years), strong ecosystem, operational simplicity, appropriate complexity

**Avoid:** Beta software, hype-driven choices, over-engineering, bleeding-edge

**Common Patterns:**
- Small: Next.js + PostgreSQL (Supabase) + Vercel
- Medium: React + Express/FastAPI + PostgreSQL + AWS
- Large: React + Go/Java + PostgreSQL + Redis + K8s
- Mobile: React Native or Flutter
- API: Go/Rust (speed) or Python/Node (dev speed)

---

## Phase 3: Project Initialization

**Pre-check:** Empty folder, Git installed, runtime installed, GitHub account

**Steps:**
1. `git init` + create `.gitignore` (AI generates based on stack)
2. GitHub repo: `gh repo create` or create via web + add remote
3. Initialize project structure (Next.js: `create-next-app`, Express+React: monorepo structure)
4. Create config files: `.eslintrc.json`, `.prettierrc`, `tsconfig.json`, `.editorconfig`, `.env.example`, `README.md`
5. Initial commit and push to main

---

## Phase 4: Foundation

**Database:** Choose local (install PostgreSQL) or cloud (Supabase/Neon). Set up ORM (Prisma/Drizzle), create initial schema.

**Auth (if needed):** Install and configure NextAuth/Auth0/Clerk. Create auth config, middleware, protected routes.

**Testing:** Install Jest/Vitest, create config, test utils, example tests.

**Scripts:** Add dev, build, lint, test, db commands to package.json.

**Commit foundation:** Push database, auth, and testing setup.

---

## Phase 5: Feature Development

**Transition:** Foundation complete → suggest first feature based on app type

**Development Loop:** For each feature, use Rules 1-4 (PRD → Tasks → Execute → Review & Commit)

**Architecture Reviews:** After 3-5 features, review strengths, improvements, and technical debt

**Pre-Deployment Checklist:** Tests passing, no errors, security checks, performance optimized, docs updated

**Deployment:** Platform-specific guide for build, environment config, deploy, verification, monitoring

---

## Adaptation Guidelines

**Beginner:** More explanations, slower pace, learning resources
**Experienced:** Focus on architecture, faster pace, assume knowledge

**MVP:** Speed over perfection, managed services, core features only
**Production:** Reliability, comprehensive testing, monitoring, documentation
**Enterprise:** Patterns, security, compliance, team scalability

## Red Flags to Avoid

❌ Alpha/beta in production
❌ Over-engineering simple apps
❌ Trendy choices without reasoning
❌ Ignoring security from start
❌ Skipping tests
❌ No error handling
❌ Hardcoded config
❌ Committing secrets

## Quality Gates

- Proper types, small focused functions, no duplication
- Unit + integration + E2E tests, >80% coverage
- Input validation, XSS/SQL injection prevention, proper auth
- No N+1 queries, proper indexing, code splitting, caching

---

**Guide users from empty folder to production-ready application with strategic architecture and automated development workflow.**

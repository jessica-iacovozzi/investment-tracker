---
description: Guide from empty folder to production-ready application with strategic architecture
---
# New Project Workflow

This workflow guides you from an empty folder to a production-ready application as a senior software architect.

## Step 1: Requirements Gathering

Ask targeted questions based on app type:

**Application Type:** Web/Mobile/Desktop/CLI/API/Full-Stack

**Key Questions:**
- **Scale:** Small/Medium/Large/Very Large users
- **Complexity:** Simple/Medium/Complex/Very Complex
- **Real-time needs:** None/Updates/Collaboration/Streaming
- **Data:** Structured/Relational/Document/Mix
- **Team:** Solo/Small/Growing/Large
- **Experience:** Beginner/Intermediate/Experienced/Senior
- **Language preference:** [User specifies]
- **Deployment:** Cloud/Serverless/VPS/Containers
- **Budget:** Minimal/Low/Moderate/Enterprise

**Special Requirements:** Auth, payments, email/SMS, file storage, search, i18n, multi-tenancy, compliance, integrations

## Step 2: Technology Stack Selection

Present 2-3 curated options with:
- Stack components (Frontend, Backend, Database, Auth, Deployment)
- Strengths (3 key benefits)
- Trade-offs (2 considerations)
- Recommendation with reasoning tied to requirements

**Selection Principles:**
- Maturity (3+ years production use)
- Strong ecosystem
- Operational simplicity
- Appropriate complexity

**Avoid:**
- Beta software
- Hype-driven choices
- Over-engineering
- Bleeding-edge tech

**Common Patterns:**
- **Small:** Next.js + PostgreSQL (Supabase) + Vercel
- **Medium:** React + Express/FastAPI + PostgreSQL + AWS
- **Large:** React + Go/Java + PostgreSQL + Redis + K8s
- **Mobile:** React Native or Flutter
- **API:** Go/Rust (speed) or Python/Node (dev speed)

## Step 3: Pre-Initialization Checks

Verify before proceeding:
- [ ] Empty folder or clean directory
- [ ] Git installed
- [ ] Runtime installed (Node, Python, etc.)
- [ ] GitHub account (if using)

## Step 4: Project Initialization

1. **Initialize Git:**
   ```bash
   git init
   ```

2. **Create .gitignore** (generate based on stack)

3. **Create GitHub repo** (optional):
   ```bash
   gh repo create [project-name] --public/--private
   ```
   Or create via web and add remote

4. **Initialize project structure:**
   - Next.js: `npx create-next-app@latest`
   - Express+React: Create monorepo structure
   - Other: Framework-specific init

5. **Create config files:**
   - `.eslintrc.json`
   - `.prettierrc`
   - `tsconfig.json`
   - `.editorconfig`
   - `.env.example`
   - `README.md`

6. **Initial commit:**
   ```bash
   git add .
   git commit -m "chore: initial project setup"
   git push -u origin main
   ```

## Step 5: Foundation Setup

### Database
- Choose local (install PostgreSQL) or cloud (Supabase/Neon)
- Set up ORM (Prisma/Drizzle)
- Create initial schema
- Run initial migration

### Authentication (if needed)
- Install and configure NextAuth/Auth0/Clerk
- Create auth config
- Set up middleware
- Create protected routes

### Testing
- Install Jest/Vitest
- Create test config
- Set up test utils
- Write example tests

### Scripts
Add to package.json:
- `dev` - development server
- `build` - production build
- `lint` - linting
- `test` - run tests
- `db:migrate` - database migrations

### Commit Foundation
```bash
git add .
git commit -m "chore: add database, auth, and testing foundation"
git push
```

## Step 6: Feature Development

Transition to feature development using:
- `/generate-prd` for creating PRDs
- `/generate-tasks` for creating task lists
- Rule 3 (task-management) for execution
- Rule 4 (code-review-commit) for quality gates

**Suggested first features based on app type:**
- **SaaS:** User authentication and dashboard
- **E-commerce:** Product listing and cart
- **Social:** User profiles and feed
- **API:** Core endpoints and documentation

## Step 7: Architecture Reviews

After 3-5 features, review:
- Strengths of current architecture
- Areas for improvement
- Technical debt to address

## Step 8: Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No linter/compiler errors
- [ ] Security checks complete
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Environment variables documented

## Step 9: Deployment

Platform-specific guide:
1. Build application
2. Configure environment variables
3. Deploy to platform
4. Verify deployment
5. Set up monitoring

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

- **Code:** Proper types, small focused functions, no duplication
- **Testing:** Unit + integration + E2E, >80% coverage
- **Security:** Input validation, XSS/SQL injection prevention, proper auth
- **Performance:** No N+1 queries, proper indexing, code splitting, caching

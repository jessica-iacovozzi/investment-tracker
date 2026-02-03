---
description: Analyze the application from a product perspective to suggest features, identify user needs, and propose enhancements
---
# Product Review Workflow

This workflow performs a comprehensive product analysis of the application, thinking strategically about user needs, market opportunities, and feature enhancements.

## Step 1: Application Discovery

Analyze the codebase to understand:
1. **Core functionality** - What does the app do today?
2. **User flows** - How do users interact with the app?
3. **Data models** - What entities exist and how are they related?
4. **UI/UX patterns** - What is the current user experience?
5. **Tech capabilities** - What technical features are available (auth, payments, notifications, etc.)?

## Step 2: User Persona Analysis

Based on the application, identify:
- **Primary users** - Who is the main audience?
- **Secondary users** - Who else might use this?
- **User goals** - What are they trying to accomplish?
- **User context** - When and where do they use this?

## Step 3: Competitive & Market Analysis

Think strategically about:
- What similar products exist in this space?
- What features are table stakes vs. differentiators?
- What trends are emerging in this domain?
- What gaps exist in the current market?

## Step 4: Pain Point Identification

Analyze the current implementation for:

### Usability Gaps
- Missing feedback or confirmation states
- Confusing navigation or information architecture
- Lack of onboarding or guidance
- Accessibility barriers

### Functional Gaps
- Manual processes that could be automated
- Missing CRUD operations
- Incomplete data relationships
- Limited filtering, sorting, or search

### Data & Insights Gaps
- Missing analytics or reporting
- No data visualization
- Limited export capabilities
- No historical tracking

### Integration Gaps
- Missing third-party integrations
- No API for external access
- Limited import capabilities

## Step 5: Feature Ideation

Generate feature ideas across categories:

### Quick Wins (Low effort, High impact)
- Small UX improvements
- Missing validations or feedback
- Performance optimizations
- Accessibility enhancements

### Core Enhancements (Medium effort, High impact)
- New functionality that extends existing features
- Improved workflows
- Better data management
- Enhanced reporting

### Strategic Features (High effort, High impact)
- Major new capabilities
- Platform expansions
- Integration opportunities
- Monetization features

### Delighters (Variable effort, User satisfaction)
- Personalization options
- Gamification elements
- Social features
- Convenience features

## Step 6: Prioritization Framework

For each feature idea, evaluate:

| Criteria | Weight | Score (1-5) |
|----------|--------|-------------|
| User Value | 30% | How much does this help users? |
| Business Value | 25% | Revenue, retention, or growth impact? |
| Technical Feasibility | 20% | How complex to implement? |
| Strategic Alignment | 15% | Does it fit the product vision? |
| Competitive Advantage | 10% | Does it differentiate us? |

Calculate weighted score and rank features.

## Step 7: Generate Product Review Report

Create output in `/tasks/product-review-[date].md`:

```markdown
# Product Review: [Application Name]
*Generated: [Date]*

## Executive Summary
[2-3 sentence overview of findings and top recommendations]

## Current State Analysis

### What the App Does Well
- [Strength 1]
- [Strength 2]
- [Strength 3]

### User Personas
| Persona | Goals | Pain Points |
|---------|-------|-------------|
| [Name] | [Goals] | [Pains] |

### Current Feature Map
[List of existing features by category]

## Identified Opportunities

### Pain Points & Gaps
1. **[Gap Name]** - [Description and impact]
2. **[Gap Name]** - [Description and impact]

### Market Opportunities
- [Opportunity 1]
- [Opportunity 2]

## Feature Recommendations

### Priority 1: Quick Wins
| Feature | User Value | Effort | Recommendation |
|---------|------------|--------|----------------|
| [Feature] | [Value] | [Effort] | [Why] |

### Priority 2: Core Enhancements
| Feature | User Value | Effort | Recommendation |
|---------|------------|--------|----------------|
| [Feature] | [Value] | [Effort] | [Why] |

### Priority 3: Strategic Features
| Feature | User Value | Effort | Recommendation |
|---------|------------|--------|----------------|
| [Feature] | [Value] | [Effort] | [Why] |

### Delighters
| Feature | User Value | Effort | Recommendation |
|---------|------------|--------|----------------|
| [Feature] | [Value] | [Effort] | [Why] |

## Detailed Feature Proposals

### [Feature Name 1]
**Problem:** [What user problem does this solve?]
**Solution:** [Brief description of the feature]
**User Stories:**
- As a [user], I want to [action] so that [benefit]

**Success Metrics:**
- [Metric 1]
- [Metric 2]

**Technical Considerations:**
- [Consideration 1]
- [Consideration 2]

**Effort Estimate:** [Low/Medium/High]
**Priority:** [P1/P2/P3]

---
*Repeat for top 5-10 feature proposals*

## Roadmap Suggestion

### Phase 1: Foundation (1-2 sprints)
- [Quick wins and critical fixes]

### Phase 2: Core Value (2-4 sprints)
- [Core enhancements that deliver main value]

### Phase 3: Growth (4+ sprints)
- [Strategic features for scale and differentiation]

## Next Steps
1. Review and prioritize recommendations
2. Select features for next sprint
3. Run `/generate-prd` for selected features
4. Execute with `/generate-tasks`

## Appendix

### Competitive Landscape
[Brief analysis of competitors]

### Technical Debt Notes
[Any technical considerations discovered]

### Research Recommendations
[Areas that need user research or validation]
```

## Step 8: Interactive Discussion

After generating the report, offer:
```
Product review complete!

Top 3 Recommendations:
1. [Feature] - [One-line value prop]
2. [Feature] - [One-line value prop]
3. [Feature] - [One-line value prop]

Options:
- "Deep dive on [feature name]" - Explore a specific feature in detail
- "Generate PRD for [feature]" - Create a PRD for a recommended feature
- "Compare [feature A] vs [feature B]" - Analyze trade-offs
- "Focus on [category]" - Get more ideas in a specific area
```

## Analysis Techniques

Use these generative AI techniques during analysis:

### Divergent Thinking
- "What if" scenarios
- Analogies from other industries
- Extreme user cases
- Future state visioning

### Convergent Thinking
- Pattern recognition across features
- Constraint-based prioritization
- ROI analysis
- Risk assessment

### User-Centered Thinking
- Jobs-to-be-done framework
- User journey mapping
- Emotional impact analysis
- Accessibility considerations

### Business Thinking
- Revenue opportunities
- Cost reduction potential
- Retention drivers
- Growth levers

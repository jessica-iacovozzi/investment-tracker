# PRD: Share the Investment Tracker with Family & Friends

## Overview
Make the investment tracker accessible to family and friends via a public URL using static hosting. The app remains client-only with local browser storage, enabling simple sharing without accounts or backend infrastructure.

## Business Context
- **Problem:** The app only runs locally, which blocks casual sharing and collaboration with family and friends.
- **Success Metrics:**
  - App is accessible via a public URL on mobile and desktop.
  - 80% of invited users can load and use the app without setup help.
  - <1% of visits report broken links or load failures.
- **Priority:** High

## Target Users
- Family and friends who want to run personal investment projections without installing software.
- Non-technical users who need a simple link to access the app.

## User Stories
1. As a family member, I want a link I can open on my phone so I can quickly model my accounts.
2. As a friend, I want the app to load quickly and work without creating an account.
3. As the owner, I want to share the app without maintaining a backend.
4. As a user, I want my inputs to stay private in my browser so I feel safe entering numbers.

## Functional Requirements

### Core Functionality
1. **Public URL access**
   - Deploy the app as static assets to a public host (Vercel/Netlify/GitHub Pages).
   - Acceptance Criteria:
     - A public URL loads the app within 3 seconds on broadband.
     - The app renders correctly on mobile and desktop.
2. **Client-only data persistence**
   - Keep local storage as the only persistence mechanism.
   - Acceptance Criteria:
     - Inputs remain stored per device/browser.
     - No user data is transmitted to external services.
3. **Share guidance**
   - Provide simple “Share” guidance within the UI footer or README (e.g., “Share this link with family/friends”).
   - Acceptance Criteria:
     - Users can locate a share hint within one scroll on the landing view.

### Data Requirements
- No new data models.
- No server-side data storage.

### User Interface
- Add a small footer or header helper text:
  - Example: “Share this app: https://<hosted-url>”
- Ensure copy is concise and accessible.
- Maintain existing layout and styling.

### Integration Points
- Static hosting service configuration.
- Optional: GitHub Actions or hosting CI for automatic deploys.

### Security & Privacy
- No authentication.
- No data transmission; local storage only.
- Provide a brief privacy note: “Data stays in your browser.”

### Performance
- App should load under 3 seconds on a typical broadband connection.
- Lighthouse performance score ≥ 85 on mobile.

## Non-Functional Requirements

### Accessibility
- Footer or helper text must be keyboard accessible and readable.
- Ensure color contrast meets WCAG 2.1 AA.

### Error Handling
- If local storage is unavailable, show a non-blocking warning with fallback behavior.
- Provide a friendly error page for hosting 404 routes (if applicable).

### Testing
- Unit tests:
  - Local storage availability helper (if added).
- Manual checks:
  - Verify hosted build loads on iOS/Android and desktop.
  - Confirm local storage persists across refresh.

## Non-Goals
- User accounts or authentication.
- Shared data or multi-user collaboration.
- Custom domain setup.
- Analytics, tracking, or telemetry.

## Technical Approach

### Architecture
- Keep the app as a static SPA.
- Use existing local storage persistence logic in `App.tsx`.

### Technology Alignment
- React + TypeScript + Vite (existing stack).
- Static hosting (Vercel/Netlify/GitHub Pages).

### Database
- None.

## Design Considerations
- Add a compact, unobtrusive “Share this app” line.
- Ensure it does not clutter the existing hero or action buttons.

## Implementation Phases

### Phase 1: MVP
- Configure static deployment (manual or CI).
- Add share helper text + privacy note.
- Validate mobile responsiveness and load time.

### Phase 2: Enhancements
- Add a “Copy link” button with feedback.
- Provide a small FAQ for data storage/privacy.

## Success Criteria

### Definition of Done
- Hosted URL is live and documented.
- UI contains share helper text and privacy note.
- Manual mobile/desktop checks pass.
- Tests (if added) pass.

### Acceptance Criteria
1. Visiting the public URL loads the app and renders all existing features.
2. The app works without requiring login or setup.
3. A user can identify how to share the app in under 10 seconds.
4. Local storage persistence continues to work after deployment.

## Dependencies & Risks

### Dependencies
- Static hosting provider account (Vercel/Netlify/GitHub Pages).
- Optional CI setup for automatic deploys.

### Risks & Mitigations
- **Risk:** Users assume data is shared with others.
  - **Mitigation:** Add explicit “Data stays in your browser” note.
- **Risk:** Routing issues on static host (refresh 404).
  - **Mitigation:** Configure SPA fallback if needed.
- **Risk:** Local storage blocked in some browsers.
  - **Mitigation:** Warn users and offer a fallback message.

## Open Questions
- None (decisions provided: static hosting, public URL, local-only data, no analytics, no custom domain).

## Assumptions
- Users are comfortable with local-only data storage.
- No backend infrastructure is required for this release.
- The app remains single-page and static.

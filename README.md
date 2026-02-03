# Investment Tracker

A client-only investment projection app for modeling multiple accounts, contributions, and growth over time.

## Live App
- **Public URL:** https://personal-multi-investment-tracker.vercel.app/

## Share & Privacy
- Share this link with family and friends: **https://personal-multi-investment-tracker.vercel.app/**
- **Data stays in your browser.** Inputs are stored locally on each device.
- No accounts, no analytics, no backend services.

## Local Storage Notes
- Data is stored in `localStorage` on the current device/browser.
- Clearing browser data or switching devices resets saved inputs.
- If local storage is blocked, the app will still run but changes will not persist.

## Development
```bash
npm install
npm run dev
```

## Tests
```bash
npm run test
```

## Deployment (Vercel)
1. Import this repo in Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Ensure `vercel.json` is present for SPA fallback rewrites.

## Goal Mode

Goal Mode enables reverse projection calculations - work backward from a financial target to determine either the required contribution amount or the time needed to reach your goal.

### Features
- **Calculate Required Contribution:** Enter your target balance and term, and the app calculates how much you need to contribute per period
- **Calculate Required Term:** Enter your target balance and contribution amount, and the app calculates how long it will take to reach your goal
- **Allocation Suggestions:** When you have multiple accounts, the app suggests how to distribute contributions proportionally based on current balances
- **Progress Tracking:** Visual progress bar shows how close your projected balance is to your goal

### How to Use
1. Click the toggle in the header to switch from "Projection Mode" to "Goal Mode"
2. Enter your target balance (e.g., $1,000,000)
3. Choose calculation type:
   - **Calculate Contribution:** Set your term (years) and frequency to see required contribution
   - **Calculate Term:** Set your contribution amount and frequency to see time to goal
4. View allocation suggestions to see how to distribute contributions across accounts

## FAQ
**Is my data shared with anyone else?**
No. Data is stored only in your browser.

**Will my inputs show up on another device?**
No. Each device/browser stores its own data.

**Can I collaborate with someone in real time?**
Not yet. This release is single-user and local-only.

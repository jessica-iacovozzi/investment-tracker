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

## FAQ
**Is my data shared with anyone else?**
No. Data is stored only in your browser.

**Will my inputs show up on another device?**
No. Each device/browser stores its own data.

**Can I collaborate with someone in real time?**
Not yet. This release is single-user and local-only.

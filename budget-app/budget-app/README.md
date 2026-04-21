# Budget Tracker

Personal budget tracker built with React + Vite + Tailwind. Data is stored in your browser's `localStorage` — nothing leaves your device.

## Run locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This outputs static files to `dist/`. You can preview the build with `npm run preview`.

## Deploy to GitHub + Vercel

1. Create a new repo on GitHub and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/budget-tracker.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click "Add New Project", and import the repo. Vercel auto-detects Vite and deploys it. You'll get a URL like `budget-tracker.vercel.app`.

3. On your Android phone, open that URL in Chrome, then tap the menu → "Add to Home Screen". The app installs as a PWA with its own icon.

## Project structure

```
src/
  App.jsx           Main component with all UI
  main.jsx          React entry point
  index.css         Tailwind imports + base styles
  useLocalStorage.js  Persistence hook
  constants.js      Default categories and color palette
```

## Roadmap ideas

- Desjardins CSV import with auto-categorization rules
- IBKR FX conversion tracker (savings vs. 1.5% Wealthsimple fee)
- Multi-month history charts
- Export data as JSON backup
- Cloud sync (Supabase or similar)

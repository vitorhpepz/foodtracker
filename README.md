# FoodTracker

A privacy-first, installable web app to track meals, estimate ingredients and nutrition from photos, keep daily/weekly records, offer guidance, and integrate with mobile health data.

## Vision
Help people effortlessly understand their nutrition by snapping a photo of their meals. Provide instant macro/calorie estimates, track progress over time, and give actionable guidance.

## What’s Built vs Not Built

- Built
  - Project initialization and README tracker
  - Web app scaffold with Vite + React (JS)
  - PWA setup (manifest via plugin, iOS meta tags)
  - Notifications demo (permission request)
  - GitHub Pages workflows (root and app-level) for `verdit.site/foodtracker`

- Not Built Yet
  - Installable PWA (iOS/Android)
  - Photo intake (camera/gallery)
  - On-device/cloud inference for ingredient detection
  - Nutrition estimation (calories/macros) per item and per meal
  - Daily log and weekly summaries/averages
  - Advice/chat session for personalized guidance
  - Weight tracking (with user prompts/reminders)
  - Baseline calorie estimation (based on weight, age, sex, height, activity)
  - Exercise sync from Apple Health / Google Fit
  - Data privacy and export controls
  - Offline support and background sync

## Core Use Cases
- Take a meal photo → detect ingredients → estimate calories/macros → save to daily log
- Review daily/weekly totals and trends
- Receive advice and prompts (e.g., hydration, protein goals)
- Record and track weight over time
- Sync exercises from mobile health platforms to refine calorie balance

## Feature Outline
- Installable Web App (PWA)
  - Web app manifest, service worker, add-to-home-screen
  - iOS support with appropriate meta tags and icons
- Photo & Recognition
  - Camera capture and gallery upload
  - Ingredient detection (model TBD)
  - Portion estimation UX flow
- Nutrition Estimation
  - Food database lookup (e.g., USDA/FDC or equivalent)
  - Per-ingredient macro/calorie summation
  - Confidence scoring and user corrections
- Tracking & Summaries
  - Daily timeline and totals
  - Weekly averages, trends, and streaks
  - Export/share data (CSV/JSON)
- Advice & Guidance
  - Chat-style session for nutrition coaching
  - Goal setting (weight, protein targets)
  - Prompts for missing data (e.g., weight entry reminders)
- Health Integrations
  - Apple HealthKit (iOS)
  - Google Fit (Android)
  - Pull exercises/steps and adjust energy balance
- Privacy & Controls
  - Local-first storage with optional cloud backup
  - Clear data export and deletion

## Initial MVP Scope (Proposed)
1. PWA shell with installability
2. Photo upload and manual food entry (basic)
3. Nutrition lookup for a few common foods
4. Daily log and weekly totals
5. Basic advice prompts (rule-based)

## Tech Notes (Proposed)
- Frontend: React + Vite (or Next.js) with Javascript
- PWA: Workbox service worker, web app manifest, icons/splash
- State: Redux Toolkit or Zustand
- Storage: IndexedDB (local), cloud sync (Cloudflare)
- Recognition: OpenAi Vision, cheapest model
- Health Integrations: Native bridges (Capacitor) or Web integrations; platform-specific guides

## Build Log
- 2025-09-26: Created initial README with scope and tracker

## Roadmap (High-Level)
- Phase 1: MVP (installable shell, manual logging, basic summaries)
- Phase 2: Photo recognition and nutrition estimation
- Phase 3: Advice chat, weight prompts, health integrations
- Phase 4: Offline-first polish, export, privacy controls

## Contributing / Setup
- To be defined once the framework is selected.

## License
TBD

## Cloudflare Worker API
Base: `https://foodtracker-api.hpepz.workers.dev`

- POST `/api/chat`
  - body: `{ "messages": [{ "role": "user", "content": "..." }], "system": "...", "temperature": 0.2 }`
  - returns: `{ text, raw }`

- POST `/api/vision`
  - body: `{ "imageUrl": "https://..." }` or `{ "imageBase64": "..." }`, optional `prompt`, `temperature`
  - returns: `{ text, raw }`

### Deploy / Secrets
```
cd worker
wrangler login
wrangler secrets put OPENAI_API_KEY
npm run deploy
```
Note: Endpoints require `OPENAI_API_KEY` to be set as a secret in Cloudflare.

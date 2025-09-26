# FoodTracker Web

Installable PWA scaffold for FoodTracker (React + Vite, JS).

## Scripts
- `npm run dev` - start dev server at base `/foodtracker/`
- `npm run build` - production build
- `npm run preview` - preview build locally

## PWA
- Manifest and service worker via `vite-plugin-pwa`
- iOS meta tags added in `index.html`
## Deploy (GitHub Pages)
This repo is configured for `verdit.site/foodtracker` via GitHub Pages. Push to `main` to deploy using the workflow in `.github/workflows/gh-pages.yml`.
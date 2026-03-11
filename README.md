# 🐱 Kudoku PWA — Kawaii Sudoku

> A Vue 3 + Vite PWA. Installable on iOS/Android. Deploy to Vercel in 2 minutes.

## 🚀 Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
cd KudokuPWA
npm install
npm run build
npx vercel --prod
```

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Settings are auto-detected:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy** — done!

## 🧑‍💻 Local Development
```bash
npm install
npm run dev
# Open http://localhost:5173
```

## 📱 Installing as PWA
- **iOS**: Open in Safari → Share → "Add to Home Screen"
- **Android/Chrome**: Address bar → Install icon, or Menu → "Add to Home Screen"

## 🏗️ Project Structure
```
src/
├── game/
│   ├── gameData.js   — 50 levels, worlds, avatars, achievements, XP math
│   └── engine.js     — Pure Sudoku logic (flat array, no mutation)
├── stores/
│   └── profile.js    — Pinia store + localStorage persistence
├── views/
│   ├── SplashView.vue
│   ├── HomeView.vue
│   ├── LevelSelectView.vue
│   ├── GameView.vue
│   ├── ProfileView.vue
│   └── AchievementsView.vue
├── components/
│   ├── SudokuBoard.vue   — Canvas-drawn board, tap + long-press
│   └── NumberPicker.vue  — Long-press number popup
├── router.js
├── style.css
└── main.js
```

## ✨ Features
- **50 levels** across 5 kawaii worlds
- **XP + leveling** up to Level 50
- **12 unlockable avatars**, 19 achievements
- **3 hints per puzzle** with lightbulb bar
- **Long-press to input** — clean, no bottom numpad
- **Canvas board** with pixel-perfect 4 thick + 8 thin grid lines
- **Offline-capable** via service worker (Workbox)
- **Portrait-locked**, safe-area aware
- **0 external dependencies** beyond Vue + Pinia + Vite

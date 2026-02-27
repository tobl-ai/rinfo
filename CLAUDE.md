# CLAUDE.md - Rinfo Project

## Build

- **Always use `--webpack` flag** for Next.js builds: `next build --webpack`
  - Firebase App Hosting's buildpack creates symlinked node_modules that break Turbopack
  - Until Firebase App Hosting supports Turbopack, always build with webpack
  - The `package.json` build script already includes this flag

## Package Manager

- Uses **yarn** (yarn.lock present in web/)

## Project Structure

```
rinfo/
├── data/           # Raw xlsx/pdf data files
├── scripts/        # Data parsing & upload scripts
└── web/            # Next.js app (Firebase App Hosting root)
    └── src/
        ├── app/           # Pages (/, /compare, /universities/[id])
        ├── components/
        │   ├── ui/        # Tabs, Section, KpiCard
        │   ├── charts/    # All chart components (recharts)
        │   └── dashboard/ # ChartsSection, KpiSection, UniversityTable
        ├── lib/           # data.ts, utils.ts, statistics.ts, firebase.ts
        ├── types/         # university.ts
        └── data/          # Static JSON (universities.json, summary.json)
```

## Firebase

- Project: `rinfo-library-stats`
- App Hosting backend: `rinfo-web` (asia-east1)
- App root directory: `web`
- Firestore: `universities` collection (426 docs) + `summary` collection

## Brand Colors

- Primary: Orange `#f47721`
- Secondary: Blue `#4a90d9`
- Tertiary: Green `#5bba6f`
- Based on rinfo.kr official site color scheme

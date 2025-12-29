# Reddit Pain Miner

## Overview
A full-stack application that mines Reddit for startup opportunities by analyzing pain points and user frustrations. Uses AI (Claude) to generate actionable business opportunity insights.

## Project Structure
```
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # UI components (Shadcn)
│   │   ├── pages/         # Dashboard, Search, Results pages
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   ├── db.ts              # Database connection
│   └── github.ts          # GitHub integration
├── shared/
│   ├── schema.ts          # Drizzle ORM models
│   └── routes.ts          # API contract definitions
└── scripts/
    └── upload-to-github.ts # GitHub push script
```

## Key Features
- Reddit mining with pain signal scoring
- AI-powered opportunity analysis
- Dashboard with search history
- Preset search templates

## Tech Stack
- Frontend: React, TypeScript, TailwindCSS, Shadcn UI, Recharts
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- AI: Anthropic Claude

## Recent Changes
- 2025-12-28: Initial build with Reddit mining, AI analysis, and GitHub integration

## GitHub Integration
Repository: https://github.com/w1123581321345589/reddit-pain-miner

To push updates to GitHub:
```bash
npx tsx scripts/upload-to-github.ts
```

## User Preferences
- Push builds to GitHub after testing
- Test before pushing new builds

## Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push database schema changes
- `npx tsx scripts/upload-to-github.ts` - Upload to GitHub

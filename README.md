# Reddit Pain Miner

A full-stack web application that mines Reddit for startup opportunities by analyzing pain points and frustrations expressed in posts. Uses AI to identify actionable business opportunities from real user problems.

## Features

- **Reddit Mining**: Search multiple subreddits with custom queries to find posts expressing user frustrations and pain points
- **Pain Signal Analysis**: Automated scoring system that detects buyer intent, frustration, and solution-seeking language
- **AI-Powered Insights**: Claude AI analyzes top pain signals and generates actionable startup opportunity recommendations
- **Dashboard**: Visual overview of recent searches, top opportunities, and pain score distribution
- **Preset Searches**: Quick-start templates for common niches (Credit Union Pain, SMB Finance, SaaS Gaps, etc.)

## Tech Stack

- **Frontend**: React + TypeScript, TailwindCSS, Shadcn UI, Recharts
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude (via Replit AI Integrations)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npm run db:push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Create a Search**: Enter a niche/topic (e.g., "credit union") and optional keywords (e.g., "frustrated OR legacy")
2. **Select Subreddits**: Choose which subreddits to mine from
3. **View Results**: Once the search completes, view:
   - AI-generated summary of opportunities
   - Top startup opportunities with confidence scores
   - All mined posts ranked by pain score
4. **Track Opportunities**: Browse all discovered opportunities across searches

## Pain Signal Scoring

Posts are scored based on language patterns:
- **Buyer Intent** (5 points): "willing to pay", "budget for", "invest in"
- **Frustration** (4 points): "frustrated", "nightmare", "hate", "sick of"
- **Stuck** (3 points): "stuck", "struggling", "can't figure out"
- **Seeking** (2 points): "is there any", "looking for", "recommend"
- **Question** (1 point): Posts starting with how/what/why

## API Endpoints

- `POST /api/searches` - Create a new search
- `GET /api/searches` - List all searches
- `GET /api/searches/:id` - Get search with results
- `GET /api/opportunities` - List all opportunities

## License

MIT

# PICTOCLASH

A FOSS alternative to Art Fight.

## What is PICTOCLASH?

PICTOCLASH is a seasonal event where artists divide into two teams and create artwork featuring characters from the opposing team ("Strikes"). Points are scored through an honour-based self-reporting system, and the winner is determined by checkpoint victories throughout the event.

- Two teams compete across seven checkpoints
- Five guilds based on artistic medium (digital, traditional, writing, mixed media, 3D)
- Self-reported honour system scoring
- PictoCash virtual currency economy
- 100% open source and community-driven

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase
- **Storage:** Supabase S3
- **Styling:** Tailwind CSS, shadcn primitives
- **Validation:** Zod

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project with the required schema

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pictoclash.git
cd pictoclash

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/                    # Next.js App Router pages
  admin/               # Admin dashboard and management
  characters/          # Character creation and viewing
  strikes/             # Strike submission and viewing
  profile/             # User profile
components/
  picto/               # PictoClash themed UI components
lib/
  cache.ts             # Cached queries with revalidation
  constants.ts         # Scoring values, limits, enums
  schema.ts            # Database types (source of truth)
  validation.ts        # Zod validation schemas
  clash-rank.ts        # Grade calculation logic
```

## Contributing

Contributions are welcome! This is a community-driven project.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Agentic coding / Vibe coding

Generally speaking, we always welcome any and all code contributions. We do however ask that all code is independently verified by at least one human. Machine or AI-assisted code reviews are fine, but since the quality of code can't be verified by such systems, we require all contributions to be reviewed by a human. Please don't submit PRs that were completely written by an agent, no matter how good you swear the agent is.

This does NOT apply to the content of the PICTOCLASH platform, for which other, much more strict guidelines on AI use apply. TLDR: PICTOCLASH is a platform for artists and their art. Artists are human, and art can only be made by humans.

## License

0BSD

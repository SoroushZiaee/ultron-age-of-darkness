# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
intelligent/
├── CLAUDE.md                    # Project instructions for Claude
└── blog-generator/              # Blog generation application
    └── frontend/                # Next.js frontend application
        ├── app/                 # Next.js App Router directory
        │   ├── layout.tsx       # Root layout component
        │   ├── page.tsx         # Home page component
        │   ├── globals.css      # Global styles
        │   └── favicon.ico      # Site favicon
        ├── public/              # Static assets
        │   └── *.svg           # SVG icons and images
        ├── package.json         # Node.js dependencies and scripts
        ├── tsconfig.json        # TypeScript configuration
        ├── next.config.ts       # Next.js configuration
        ├── tailwind.config.ts   # Tailwind CSS configuration (if present)
        └── postcss.config.mjs   # PostCSS configuration for Tailwind
```

## Technology Stack

### Frontend (blog-generator/frontend)
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Build Tool**: Next.js with Turbopack

## Development Commands

### Frontend Commands
Run these commands from `blog-generator/frontend/` directory:

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## File Definitions

### Core Application Files
- **app/layout.tsx**: Root layout that wraps all pages, defines HTML structure and global providers
- **app/page.tsx**: Main landing page component
- **app/globals.css**: Global CSS styles and Tailwind directives
- **next.config.ts**: Next.js configuration for routing, optimizations, and build settings
- **tsconfig.json**: TypeScript compiler options and path mappings
- **postcss.config.mjs**: PostCSS plugins configuration for Tailwind CSS processing

## Important Notes

- The project uses Next.js App Router (located in `/app` directory)
- Turbopack is enabled for faster development builds
- React 19.1.0 is being used (latest version with new features)
- Tailwind CSS 4 is configured for styling
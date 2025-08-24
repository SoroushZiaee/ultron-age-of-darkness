# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
intelligent/
├── CLAUDE.md                    # Project instructions for Claude
└── blog-generator/              # Blog generation application
    ├── frontend/                # Next.js frontend application
    │   ├── app/                 # Next.js App Router directory
    │   │   ├── layout.tsx       # Root layout component
    │   │   ├── page.tsx         # Main blog generation UI with 4 phases
    │   │   ├── globals.css      # Global styles
    │   │   └── favicon.ico      # Site favicon
    │   ├── public/              # Static assets
    │   │   └── *.svg           # SVG icons and images
    │   ├── package.json         # Node.js dependencies and scripts
    │   ├── tsconfig.json        # TypeScript configuration
    │   ├── next.config.ts       # Next.js configuration (with standalone output)
    │   ├── tailwind.config.ts   # Tailwind CSS configuration (if present)
    │   ├── postcss.config.mjs   # PostCSS configuration for Tailwind
    │   ├── Dockerfile           # Production Docker configuration for Next.js
    │   ├── Dockerfile.dev       # Development Docker configuration with hot reload
    │   └── .dockerignore        # Docker ignore file for frontend
    ├── services/                # Backend services and utilities
    │   ├── blog_generator.py    # Python script for AI-powered blog generation
    │   ├── api_gateway.py       # FastAPI gateway connecting frontend to backend
    │   ├── requirements.txt     # Python dependencies for services
    │   ├── Dockerfile           # Docker configuration for Python services
    │   ├── .dockerignore        # Docker ignore file for services
    │   └── outputs/             # Generated blog output files
    │       └── *.md            # Generated markdown blog posts
    ├── docker-compose.yml       # Production Docker orchestration
    ├── docker-compose.dev.yml   # Development Docker orchestration
    ├── nginx.conf               # Nginx reverse proxy configuration
    └── .env.example             # Environment variables template
```

## Technology Stack

### Frontend (blog-generator/frontend)
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Build Tool**: Next.js with Turbopack

### Backend Services (blog-generator/services)
- **Language**: Python 3.x
- **Web Framework**: FastAPI with uvicorn ASGI server
- **AI Integration**: OpenAI GPT-4o and GPT-4o-mini models
- **Environment**: python-dotenv for configuration
- **Output Format**: Markdown (.md) files
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Container**: Docker with Python 3.11 slim base image

### Infrastructure & DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for service coordination
- **Reverse Proxy**: Nginx with rate limiting and SSL support
- **Development**: Hot reload enabled containers for development
- **Production**: Optimized builds with security hardening

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

### Backend Commands
Run these commands from `blog-generator/services/` directory:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with: OPENAI_API_KEY=your_key_here

# Run FastAPI gateway server
python api_gateway.py
# or alternatively
uvicorn api_gateway:app --reload --port 8000

# Run blog generator directly (standalone)
python blog_generator.py

# Generate specific topic (standalone)
python -c "from blog_generator import create_blog; create_blog('AI in Healthcare')"

# View API documentation
# Open http://localhost:8000/docs (Swagger UI)
# or http://localhost:8000/redoc (ReDoc)
```

### Docker Commands
Run these commands from the `blog-generator/` root directory:

```bash
# Development environment (with hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose up --build -d

# Production with Nginx reverse proxy
docker-compose --profile production up --build -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build api
docker-compose build frontend

# Clean up (remove containers, networks, volumes)
docker-compose down -v --remove-orphans
docker system prune -a
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Add your OpenAI API key to .env file:
# OPENAI_API_KEY=sk-proj-your-key-here
```

## Application Features

### Blog Generation System UI
The frontend implements a comprehensive 4-phase blog generation system:

1. **Input Phase** (`currentPhase: 'input'`)
   - Research topic input with validation
   - Configuration panel (word count: 500-2000, tone, paper count: 3-10)
   - Section toggles (FAQ, Statistics, Real-world Examples)
   - System health check display
   - Topic validation and error prevention

2. **Progress Phase** (`currentPhase: 'progress'`)
   - Real-time progress tracking with 3 stages:
     - Research Phase: Paper search and discovery
     - Generation Phase: Content creation
     - Validation Phase: Content validation
   - Visual progress bars with percentages
   - Dynamic status messages and paper count updates
   - Low-bandwidth mode options
   - Session ID tracking

3. **Success Phase** (`currentPhase: 'success'`)
   - Blog preview with title, word count, reading time, citations
   - Multiple download options: Markdown, PDF, Copy to Clipboard
   - Edit in Editor and Email functionality
   - "Generate Another Blog" option

4. **Error Phase** (`currentPhase: 'error'`)
   - Three error types with specific recovery strategies:
     - API Error: Service unavailable (retry, wait, simplify, partial download)
     - Research Error: Insufficient papers (broaden, alternatives, manual entry)
     - Network Error: Connection issues (reconnect, save draft, fresh start)
   - Recovery success metrics and recommendations
   - Progressive degradation options

### Quick Actions Bar
- Fixed position toolbar with 5 actions: Save Progress, Restart, Email Support, View History, Help
- Always accessible across all phases

## File Definitions

### Frontend Files
- **app/layout.tsx**: Root layout that wraps all pages, defines HTML structure and global providers
- **app/page.tsx**: Main blog generation UI with complete 4-phase system implementation
- **app/globals.css**: Global CSS styles and Tailwind directives
- **next.config.ts**: Next.js configuration for routing, optimizations, and build settings
- **tsconfig.json**: TypeScript compiler options and path mappings
- **postcss.config.mjs**: PostCSS plugins configuration for Tailwind CSS processing

### Backend Files
- **services/blog_generator.py**: Complete AI-powered blog generation pipeline
  - OpenAI GPT-4o integration for research paper discovery
  - GPT-4o-mini for blog content generation
  - Structured JSON schemas for research and blog output
  - Validation functions for DOI format and content deduplication
  - Markdown output generation with references
- **services/api_gateway.py**: FastAPI gateway server
  - RESTful API endpoints matching frontend requirements
  - Pydantic models for request/response validation
  - Background task processing for long-running generation
  - Session management with progress tracking
  - CORS configuration for Next.js frontend integration
  - Error handling with frontend-compatible error types
- **services/requirements.txt**: Python dependencies for FastAPI and OpenAI integration
- **services/outputs/**: Directory for generated blog markdown files

## AI Integration Details

### Research Paper Discovery
- Uses OpenAI GPT-4o for intelligent paper search and selection
- Implements evidence hierarchy: meta-analyses > RCTs > others
- Validates DOI formats and deduplicates results
- Returns exactly 5 papers with structured metadata
- Includes citation counts and evidence types

### Blog Content Generation  
- Uses GPT-4o-mini for cost-effective content creation
- Generates 900-1100 word blogs with structured sections:
  - Compelling hook and key takeaways
  - Real-world spotlights (3 vignettes)
  - Statistical insights ("By the Numbers")
  - FAQ section (3 Q&As)
  - Practical recommendations
  - Numbered references with proper citations
- Conversational tone targeting 8th-10th grade reading level

## Important Notes

### Frontend Architecture
- The project uses Next.js App Router (located in `/app` directory)
- Turbopack is enabled for faster development builds
- React 19.1.0 is being used (latest version with new features)
- Tailwind CSS 4 is configured for styling
- Single-page application with phase-based state management
- TypeScript for type safety with custom types for phases, errors, and stages

### Backend Architecture  
- Python-based service with OpenAI API integration
- Structured JSON schemas for API responses
- Error handling and validation at multiple levels
- File-based output system for generated content
- Environment variable configuration for API keys

### Development Notes
- Frontend can connect to FastAPI gateway at http://localhost:8000
- FastAPI gateway provides real blog generation via OpenAI API
- Background task processing allows for real-time progress updates
- Session-based architecture supports multiple concurrent generations
- Debug controls included for testing different error scenarios
- Responsive design optimized for desktop and mobile
- Progressive enhancement with graceful fallbacks

### Docker Architecture
- **Multi-stage builds** for optimized production images
- **Health checks** ensure services are ready before dependent services start
- **Volume mounts** for persistent data (outputs directory)
- **Network isolation** with custom Docker network
- **Non-root users** in containers for security
- **Development vs Production** configurations for different environments

### API Endpoints
- `GET /health` - System health check
- `POST /generate` - Start blog generation (returns session_id)
- `GET /status/{session_id}` - Get generation progress/status
- `GET /result/{session_id}` - Get completed blog result
- `DELETE /session/{session_id}` - Cancel generation session
- `GET /sessions` - List active sessions (debug endpoint)

### Frontend Integration
To connect frontend to the API gateway, update the `generateBlog` function in `page.tsx` to make HTTP requests to:
- POST `/generate` with BlogGenerationRequest
- Poll GET `/status/{session_id}` for progress updates
- GET `/result/{session_id}` when completed

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
intelligent/
├── CLAUDE.md                    # Project instructions for Claude
├── docs/                        # Documentation and history
│   └── history/                 # Implementation history files
├── main-hub/                    # Main service hub (centralized management)
│   ├── frontend/                # Next.js hub frontend
│   │   ├── app/                 # Next.js App Router directory
│   │   │   ├── layout.tsx       # Root hub layout component
│   │   │   ├── page.tsx         # Main dashboard with service overview
│   │   │   ├── globals.css      # Global hub styles
│   │   │   ├── services/        # Service-specific pages
│   │   │   │   ├── page.tsx     # All services listing page
│   │   │   │   └── blog-generator/ # Individual service pages
│   │   │   │       └── page.tsx # Blog generator service page
│   │   │   ├── health/          # Health monitoring pages
│   │   │   │   └── page.tsx     # Service health dashboard
│   │   │   └── api/             # API routes (if needed)
│   │   ├── components/          # Reusable hub components
│   │   │   ├── ServiceCard.tsx  # Individual service cards
│   │   │   ├── ServiceGrid.tsx  # Services grid layout
│   │   │   └── Navigation.tsx   # Main navigation component
│   │   ├── lib/                 # Hub utilities and logic
│   │   │   ├── services.ts      # Service registry and metadata
│   │   │   └── health.ts        # Service health checking utilities
│   │   ├── public/              # Hub static assets
│   │   ├── package.json         # Hub dependencies and scripts
│   │   ├── package-lock.json    # Locked dependency versions
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   ├── next.config.ts       # Next.js configuration
│   │   ├── next-env.d.ts        # Next.js TypeScript declarations
│   │   ├── tailwind.config.ts   # Tailwind CSS configuration
│   │   ├── postcss.config.mjs   # PostCSS configuration
│   │   ├── Dockerfile           # Production Docker configuration
│   │   ├── Dockerfile.dev       # Development Docker configuration
│   │   └── .dockerignore        # Docker ignore file
│   ├── docker-compose.yml       # Hub orchestration (includes all services)
│   ├── docker-compose.dev.yml   # Development orchestration
│   └── .env.example             # Environment variables template
└── blog-generator/              # Blog generation service
    ├── frontend/                # Next.js frontend application
    │   ├── app/                 # Next.js App Router directory
    │   │   ├── layout.tsx       # Root layout component
    │   │   ├── page.tsx         # Main blog generation UI with 4 phases
    │   │   ├── globals.css      # Global styles
    │   │   └── favicon.ico      # Site favicon
    │   ├── components/          # React components directory
    │   │   └── ClientOnly.tsx   # Client-side only rendering wrapper
    │   ├── public/              # Static assets
    │   │   ├── file.svg         # File icon
    │   │   ├── globe.svg        # Globe icon
    │   │   ├── next.svg         # Next.js logo
    │   │   ├── vercel.svg       # Vercel logo
    │   │   └── window.svg       # Window icon
    │   ├── package.json         # Node.js dependencies and scripts
    │   ├── package-lock.json    # Locked dependency versions
    │   ├── tsconfig.json        # TypeScript configuration
    │   ├── next.config.ts       # Next.js configuration (with standalone output)
    │   ├── next-env.d.ts        # Next.js TypeScript declarations
    │   ├── postcss.config.mjs   # PostCSS configuration for Tailwind
    │   ├── README.md            # Frontend documentation
    │   ├── Dockerfile           # Production Docker configuration for Next.js
    │   ├── Dockerfile.dev       # Development Docker configuration with hot reload
    │   └── node_modules/        # Installed npm dependencies
    ├── services/                # Backend services and utilities
    │   ├── blog_generator.py    # Python script for AI-powered blog generation
    │   ├── api_gateway.py       # FastAPI gateway connecting frontend to backend
    │   ├── requirements.txt     # Python dependencies for services
    │   ├── Dockerfile           # Docker configuration for Python services
    │   ├── check_imports.py     # Import validation utility
    │   ├── test_openai.py       # OpenAI API integration tests
    │   ├── test_simple_generation.py # Simple blog generation tests
    │   └── outputs/             # Generated blog output files
    │       ├── ai-in-healthcare.md # Generated blog: AI in Healthcare
    │       ├── ai-testing.md    # Generated blog: AI Testing
    │       └── how-to-get-diagnoses-faster?.md # Generated blog: Faster Diagnoses
    ├── docker-compose.yml       # Production Docker orchestration
    ├── docker-compose.dev.yml   # Development Docker orchestration
    ├── nginx.conf               # Nginx reverse proxy configuration
    ├── debug-docker.sh          # Docker debugging script
    ├── debug-ui-api.html        # API debugging interface
    └── test-integration.sh      # Integration testing script
```

## Technology Stack

### Main Hub (main-hub/frontend)
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Build Tool**: Next.js with Turbopack
- **Architecture**: Centralized service management and discovery
- **Health Monitoring**: Real-time service health checks and monitoring
- **Service Registry**: Dynamic service discovery and metadata management

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

### Main Hub Commands
Run these commands from `main-hub/frontend/` directory:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Hub Docker Commands
Run these commands from `main-hub/` root directory:

```bash
# Development environment (all services with hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Production environment (all services)
docker-compose up --build -d

# Stop all services
docker-compose down

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f hub-frontend
docker-compose logs -f blog-generator-api

# Rebuild specific service
docker-compose build hub-frontend
docker-compose build blog-generator-frontend

# Clean up (remove containers, networks, volumes)
docker-compose down -v --remove-orphans
```

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

### Testing & Debugging Commands
Run these commands from `blog-generator/` root directory:

```bash
# Test OpenAI API integration
cd services && python test_openai.py

# Test simple blog generation
cd services && python test_simple_generation.py

# Validate Python imports
cd services && python check_imports.py

# Run integration tests
./test-integration.sh

# Debug Docker containers
./debug-docker.sh

# Use standalone API testing interface
# Open debug-ui-api.html in browser for interactive API testing
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

### Main Hub Features

#### Service Management Dashboard
The main hub provides a centralized platform for managing multiple intelligent services:

1. **Service Discovery & Registry**
   - Dynamic service registration and metadata management
   - Categorized service organization (AI, Utilities, Analytics, Communication, Development)
   - Service search and filtering capabilities
   - Tag-based service organization

2. **Real-time Health Monitoring**
   - Continuous health checks for all registered services
   - Response time monitoring and performance metrics
   - Service status indicators (healthy, unhealthy, unknown)
   - Automated health check scheduling (30-second intervals)
   - Health history and error reporting

3. **Service Cards & Grid Layout**
   - Rich service cards with metadata, features, and status
   - Multiple view modes (grid and list)
   - Service launch functionality (opens in new tab)
   - Quick access to documentation and repositories
   - Service version tracking and update notifications

4. **Navigation & User Experience**
   - Responsive design optimized for desktop and mobile
   - Clean, modern interface with Tailwind CSS
   - Intuitive navigation between dashboard, services, and health monitoring
   - Quick stats and service overview on main dashboard

#### Hub Architecture Benefits
- **Scalability**: Easy addition of new services through service registry
- **Maintainability**: Centralized management reduces operational complexity
- **Discoverability**: Users can find and access all services from one location
- **Monitoring**: Comprehensive health monitoring across all services
- **Consistency**: Unified user experience across different service types

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

### Main Hub Files
- **main-hub/frontend/app/layout.tsx**: Root hub layout with navigation and global providers
- **main-hub/frontend/app/page.tsx**: Main dashboard with service overview, stats, and quick access
- **main-hub/frontend/app/services/page.tsx**: Complete services listing with search and filters
- **main-hub/frontend/app/health/page.tsx**: Real-time service health monitoring dashboard
- **main-hub/frontend/components/ServiceCard.tsx**: Individual service cards with launch, health, and metadata
- **main-hub/frontend/components/ServiceGrid.tsx**: Grid layout with search, filtering, and view modes
- **main-hub/frontend/components/Navigation.tsx**: Main hub navigation with responsive mobile menu
- **main-hub/frontend/lib/services.ts**: Service registry, metadata definitions, and discovery functions
- **main-hub/frontend/lib/health.ts**: Health checking utilities and status management
- **main-hub/frontend/globals.css**: Global hub styles and Tailwind directives
- **main-hub/docker-compose.yml**: Production orchestration for hub and all services
- **main-hub/docker-compose.dev.yml**: Development orchestration with hot reload

### Frontend Files
- **app/layout.tsx**: Root layout that wraps all pages, defines HTML structure and global providers
- **app/page.tsx**: Main blog generation UI with complete 4-phase system implementation
- **app/globals.css**: Global CSS styles and Tailwind directives
- **components/ClientOnly.tsx**: Client-side only rendering wrapper component
- **next.config.ts**: Next.js configuration for routing, optimizations, and build settings
- **tsconfig.json**: TypeScript compiler options and path mappings
- **next-env.d.ts**: Next.js TypeScript environment declarations
- **postcss.config.mjs**: PostCSS plugins configuration for Tailwind CSS processing
- **README.md**: Frontend-specific documentation and setup instructions
- **package.json**: Node.js dependencies, scripts, and project metadata
- **package-lock.json**: Locked dependency versions for reproducible builds

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
- **services/check_imports.py**: Python import validation utility for debugging
- **services/test_openai.py**: OpenAI API integration testing script
- **services/test_simple_generation.py**: Simple blog generation testing script
- **services/outputs/**: Directory for generated blog markdown files
  - **ai-in-healthcare.md**: Sample generated blog about AI in healthcare
  - **ai-testing.md**: Sample generated blog about AI testing methodologies
  - **how-to-get-diagnoses-faster?.md**: Sample generated blog about faster medical diagnoses

### Infrastructure & Testing Files
- **debug-docker.sh**: Docker container debugging and troubleshooting script
- **debug-ui-api.html**: Standalone HTML interface for API testing and debugging
- **test-integration.sh**: End-to-end integration testing script for the full pipeline

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

#### Main Hub Architecture
- **Hub Frontend**: Runs on http://localhost:3000 (main entry point)
- **Service Registry**: Dynamic service discovery and metadata management
- **Health Monitoring**: Real-time health checks every 30 seconds
- **Service Integration**: Seamless integration with existing blog-generator service
- **Docker Orchestration**: Single command deployment of all services
- **Responsive Design**: Optimized for desktop and mobile with Tailwind CSS

#### Service Integration
- **Blog Generator Frontend**: Accessible via hub at http://localhost:3001
- **Blog Generator API**: FastAPI gateway at http://localhost:8000
- **Service Health**: Monitored through hub health dashboard
- **Service Discovery**: Registered in hub service registry
- **Unified Experience**: Consistent navigation and styling across all services

#### Development Workflow
- Frontend can connect to FastAPI gateway at http://localhost:8000
- FastAPI gateway provides real blog generation via OpenAI API
- Background task processing allows for real-time progress updates
- Session-based architecture supports multiple concurrent generations
- Debug controls included for testing different error scenarios
- Hub provides centralized monitoring and management capabilities
- Progressive enhancement with graceful fallbacks

### Testing & Debugging Infrastructure
- **Comprehensive test suite**: Individual scripts for OpenAI integration, blog generation, and import validation
- **Integration testing**: End-to-end pipeline testing with `test-integration.sh`
- **Docker debugging**: Specialized debugging script for container troubleshooting
- **API testing interface**: Standalone HTML page for interactive API debugging
- **Sample outputs**: Pre-generated blog examples for reference and testing
- **Component isolation**: `ClientOnly.tsx` wrapper for proper SSR/CSR handling

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
- after each prompt, add the new directories and explaintion of the new implementation to the claude.md
- after each implementation, write a summary all implementation details, for each details create a new file with a date of that day to track the history of implementation, if there is a file for that date just modify it, all files should be in /Users/soroush/Documents/Code/freelance-project/farhad/intelligent/docs/history
- before starting any implementation, read the latest implementation history of that file to understand changes
- Now we're at the critical part of the project so each changes should not reflect the whole implementation
"""
FastAPI Gateway for Blog Generator
Connects the Next.js frontend with the Python blog generation service
"""

import os
import asyncio
import json
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import the existing blog generator functions
from blog_generator import get_research_papers, generate_blog, save_blog

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Blog Generator API",
    description="AI-powered research-based blog generation service",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://0.0.0.0:3000",
        "http://localhost:3001",  # In case frontend runs on different port
        "*"  # Allow all origins in development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ============================================================================
# PYDANTIC MODELS - Request/Response schemas matching frontend
# ============================================================================

class BlogGenerationRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500, description="Research topic")
    word_count: int = Field(1000, ge=500, le=2000, description="Target word count")
    tone: str = Field("conversational", pattern="^(conversational|professional|academic)$")
    paper_count: int = Field(5, ge=3, le=10, description="Number of research papers to use")
    include_faq: bool = Field(False, description="Include FAQ section")
    include_statistics: bool = Field(False, description="Include statistics section")
    include_examples: bool = Field(False, description="Include real-world examples")

class ProgressUpdate(BaseModel):
    stage: str = Field(..., description="Current stage: research, generation, validation")
    progress: int = Field(..., ge=0, le=100, description="Stage progress percentage")
    message: str = Field(..., description="Current status message")
    found_papers: Optional[int] = Field(None, description="Number of papers found")

class BlogGenerationResponse(BaseModel):
    session_id: str = Field(..., description="Unique session identifier")
    title: str = Field(..., description="Generated blog title")
    content: str = Field(..., description="Generated blog content in Markdown")
    word_count: int = Field(..., description="Actual word count")
    estimated_read_time: int = Field(..., description="Estimated reading time in minutes")
    citation_count: int = Field(..., description="Number of citations")
    created_at: str = Field(..., description="Creation timestamp")

class ErrorResponse(BaseModel):
    error_type: str = Field(..., description="Error type: api_error, research_error, network_error")
    message: str = Field(..., description="Error message")
    details: str = Field(..., description="Detailed error information")
    retry_count: int = Field(0, description="Current retry count")
    session_id: Optional[str] = Field(None, description="Session ID if available")

class HealthStatus(BaseModel):
    openai_api: str = Field(..., description="OpenAI API status")
    database: str = Field(..., description="Database status") 
    storage: str = Field(..., description="Storage status")
    timestamp: str = Field(..., description="Health check timestamp")

# ============================================================================
# IN-MEMORY SESSION STORAGE
# ============================================================================

# Store active generation sessions
active_sessions: Dict[str, Dict[str, Any]] = {}

def create_session_id() -> str:
    """Generate unique session ID"""
    return f"session_{int(datetime.now().timestamp() * 1000)}"

# ============================================================================
# BACKGROUND TASK FUNCTIONS
# ============================================================================

async def generate_blog_background(session_id: str, request: BlogGenerationRequest):
    """Background task for blog generation with progress updates"""
    try:
        # Initialize session
        active_sessions[session_id] = {
            "status": "running",
            "stage": "research",
            "progress": {"research": 0, "generation": 0, "validation": 0},
            "found_papers": 0,
            "error": None,
            "result": None
        }

        # Research phase
        session = active_sessions[session_id]
        session["stage"] = "research"
        
        # Simulate incremental progress updates
        for i in range(0, 101, 10):
            if session_id not in active_sessions:
                return  # Session was cancelled
                
            session["progress"]["research"] = i
            if i == 30:
                session["found_papers"] = 3
            elif i == 60:
                session["found_papers"] = request.paper_count
            await asyncio.sleep(0.2)

        # Get research papers
        research_data = get_research_papers(request.topic)
        session["found_papers"] = len(research_data.get("papers", []))

        # Generation phase
        session["stage"] = "generation"
        for i in range(0, 101, 15):
            if session_id not in active_sessions:
                return
                
            session["progress"]["generation"] = i
            await asyncio.sleep(0.3)

        # Generate blog content
        blog_data = generate_blog(research_data)

        # Validation phase
        session["stage"] = "validation"
        for i in range(0, 101, 20):
            if session_id not in active_sessions:
                return
                
            session["progress"]["validation"] = i
            await asyncio.sleep(0.15)

        # Save blog
        filepath = save_blog(blog_data, request.topic)

        # Calculate reading time
        estimated_read_time = max(1, request.word_count // 200)

        # Update session with results
        session["status"] = "completed"
        session["result"] = BlogGenerationResponse(
            session_id=session_id,
            title=blog_data["title"],
            content=blog_data["body_md"],
            word_count=blog_data["word_count"],
            estimated_read_time=estimated_read_time,
            citation_count=len(blog_data["references"]),
            created_at=datetime.now().isoformat()
        )

    except Exception as e:
        # Handle errors
        error_type = "api_error"
        if "research" in str(e).lower() or "papers" in str(e).lower():
            error_type = "research_error"
        elif "network" in str(e).lower() or "timeout" in str(e).lower():
            error_type = "network_error"

        active_sessions[session_id] = {
            "status": "error",
            "error": ErrorResponse(
                error_type=error_type,
                message=str(e),
                details=f"Error during {active_sessions.get(session_id, {}).get('stage', 'unknown')} phase",
                session_id=session_id
            )
        }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthStatus)
async def health_check():
    """System health check endpoint"""
    # Check OpenAI API
    openai_status = "online" if os.getenv("OPENAI_API_KEY") else "offline"
    
    return HealthStatus(
        openai_api=openai_status,
        database="online",  # Mock status
        storage="online",   # Mock status
        timestamp=datetime.now().isoformat()
    )

@app.post("/generate", response_model=dict)
async def start_blog_generation(request: BlogGenerationRequest, background_tasks: BackgroundTasks):
    """Start blog generation process"""
    try:
        # Validate OpenAI API key
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key not configured"
            )

        # Create session
        session_id = create_session_id()
        
        # Start background generation
        background_tasks.add_task(generate_blog_background, session_id, request)
        
        return {
            "session_id": session_id,
            "message": "Blog generation started",
            "status": "initiated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{session_id}", response_model=dict)
async def get_generation_status(session_id: str):
    """Get current generation status and progress"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    if session["status"] == "error":
        return {
            "status": "error",
            "error": session["error"].dict()
        }
    elif session["status"] == "completed":
        return {
            "status": "completed",
            "result": session["result"].dict()
        }
    else:
        # Running status
        current_stage = session["stage"]
        progress = session["progress"]
        
        # Determine status message
        if current_stage == "research":
            if session["found_papers"] > 0:
                message = f"→ Found {session['found_papers']} relevant papers"
            else:
                message = "✓ Searching papers..."
        elif current_stage == "generation":
            message = "→ Writing content..."
        elif current_stage == "validation":
            message = "→ Validating content..."
        else:
            message = "⏳ Processing..."
        
        return {
            "status": "running",
            "stage": current_stage,
            "progress": progress,
            "message": message,
            "found_papers": session.get("found_papers", 0),
            "session_id": session_id
        }

@app.get("/result/{session_id}", response_model=BlogGenerationResponse)
async def get_blog_result(session_id: str):
    """Get completed blog generation result"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    if session["status"] == "completed":
        return session["result"]
    elif session["status"] == "error":
        raise HTTPException(status_code=500, detail=session["error"].dict())
    else:
        raise HTTPException(status_code=202, detail="Generation still in progress")

@app.delete("/session/{session_id}")
async def cancel_generation(session_id: str):
    """Cancel active generation session"""
    if session_id in active_sessions:
        del active_sessions[session_id]
        return {"message": "Session cancelled", "session_id": session_id}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/sessions")
async def list_active_sessions():
    """List all active sessions (for debugging)"""
    return {
        "active_sessions": len(active_sessions),
        "sessions": {
            sid: {"status": session["status"], "stage": session.get("stage")} 
            for sid, session in active_sessions.items()
        }
    }

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    error_type = "api_error"
    if exc.status_code == 404:
        error_type = "network_error"
    elif "research" in str(exc.detail).lower():
        error_type = "research_error"
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_type": error_type,
            "message": exc.detail,
            "details": f"HTTP {exc.status_code} error",
            "timestamp": datetime.now().isoformat()
        }
    )

# ============================================================================
# STARTUP MESSAGE
# ============================================================================

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 50)
    print("🚀 BLOG GENERATOR API GATEWAY")
    print("=" * 50)
    print(f"📡 Server starting on http://localhost:8000")
    print(f"📖 API docs available at http://localhost:8000/docs")
    print(f"🔑 OpenAI API: {'✓ Configured' if os.getenv('OPENAI_API_KEY') else '❌ Not configured'}")
    print("=" * 50 + "\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api_gateway:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
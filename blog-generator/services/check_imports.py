#!/usr/bin/env python3
"""
Quick script to check if all imports can be resolved
"""

import sys
import importlib

# List of modules that should be importable
modules_to_check = [
    'fastapi',
    'uvicorn', 
    'pydantic',
    'python_dotenv',  # Note: python-dotenv imports as python_dotenv
    'openai',
    'requests',
    'asyncio',
    'json',
    'os',
    'pathlib',
    'datetime',
    'typing',
]

print("🔍 Checking Python imports...")
print("=" * 40)

missing_modules = []
working_modules = []

for module in modules_to_check:
    try:
        # Handle special cases
        if module == 'python_dotenv':
            importlib.import_module('dotenv')
        else:
            importlib.import_module(module)
        print(f"✅ {module}")
        working_modules.append(module)
    except ImportError as e:
        print(f"❌ {module} - {e}")
        missing_modules.append(module)

print("\n" + "=" * 40)
print(f"✅ Working: {len(working_modules)}")
print(f"❌ Missing: {len(missing_modules)}")

if missing_modules:
    print(f"\n🚨 Missing modules: {', '.join(missing_modules)}")
    print("Install with: pip install " + " ".join(missing_modules))
    sys.exit(1)
else:
    print("\n🎉 All required modules are available!")
    
# Test specific imports from our files
print("\n🔍 Testing specific imports from our code...")
try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks
    print("✅ FastAPI imports")
except ImportError as e:
    print(f"❌ FastAPI imports - {e}")

try:
    from fastapi.middleware.cors import CORSMiddleware
    print("✅ CORS middleware")
except ImportError as e:
    print(f"❌ CORS middleware - {e}")

try:
    from pydantic import BaseModel, Field
    print("✅ Pydantic imports")
except ImportError as e:
    print(f"❌ Pydantic imports - {e}")

try:
    from openai import OpenAI
    print("✅ OpenAI import")
except ImportError as e:
    print(f"❌ OpenAI import - {e}")

print("\n✨ Import check complete!")
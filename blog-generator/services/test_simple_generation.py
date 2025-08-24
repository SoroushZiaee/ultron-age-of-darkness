#!/usr/bin/env python3
"""
Simple test for basic blog generation to isolate the issue
"""
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Test OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("❌ No OpenAI API key found")
    exit(1)

client = OpenAI(api_key=api_key)

print("🧪 Testing Simple Blog Generation")
print("=" * 40)

# Simple blog schema without strict validation
SIMPLE_BLOG_SCHEMA = {
    "name": "simple_blog",
    "schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "content": {"type": "string"},
            "word_count": {"type": "integer"}
        },
        "required": ["title", "content", "word_count"],
        "additionalProperties": False
    }
}

try:
    print("🔄 Generating simple blog...")
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system", 
                "content": "You are a helpful blog writer. Generate a JSON response with title, content, and word_count fields."
            },
            {
                "role": "user", 
                "content": "Write a short 200-word blog post about AI testing. Return as JSON with title, content, and word_count fields."
            }
        ],
        response_format={"type": "json_schema", "json_schema": SIMPLE_BLOG_SCHEMA},
        max_completion_tokens=800,
        temperature=0.7,
    )
    
    content = response.choices[0].message.content
    print(f"📄 Raw response ({len(content)} chars):")
    print(content[:200] + "..." if len(content) > 200 else content)
    
    # Try parsing
    try:
        blog_data = json.loads(content)
        print("\n✅ JSON parsing successful!")
        print(f"Title: {blog_data.get('title', 'N/A')}")
        print(f"Word count: {blog_data.get('word_count', 'N/A')}")
        print(f"Content length: {len(blog_data.get('content', ''))}")
        
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON parsing failed: {e}")
        print("This indicates an issue with OpenAI's response format")
        
except Exception as e:
    print(f"❌ API call failed: {e}")
    print("Check your API key and internet connection")

print("\n🏁 Test complete")
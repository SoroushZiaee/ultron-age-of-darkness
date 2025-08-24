#!/usr/bin/env python3
"""
Quick test script to verify OpenAI API key is working
"""
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Test OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")

print("🔑 Testing OpenAI API Connection")
print("=" * 40)

if not api_key:
    print("❌ No OpenAI API key found in environment")
    print("Please set OPENAI_API_KEY in .env file")
    exit(1)

print(f"✓ API key found: {api_key[:20]}...")

try:
    client = OpenAI(api_key=api_key)
    
    # Test simple completion
    print("🔄 Testing API call...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say 'API test successful'"}],
        max_tokens=10
    )
    
    print("✅ OpenAI API is working!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ OpenAI API error: {e}")
    print("Check your API key and internet connection")
    exit(1)

print("\n🎉 All tests passed! Blog generation should work now.")
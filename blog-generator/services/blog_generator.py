"""
AI Research Blog Generator - All-in-One File
Put your OpenAI API key in .env file: OPENAI_API_KEY=sk-proj-...
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("Please set OPENAI_API_KEY in .env file")

client = OpenAI(api_key=API_KEY)

# ============================================================================
# SCHEMAS - Your existing schemas here
# ============================================================================

RESEARCH_SCHEMA = {
    "name": "research_papers",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "topic": {"type": "string"},
            "papers": {
                "type": "array",
                "minItems": 5,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "title",
                        "authors",
                        "abstract",
                        "evidence_type",
                        "journal",
                        "doi",
                        "citations",
                    ],
                    "properties": {
                        "title": {"type": "string"},
                        "authors": {"type": "array", "items": {"type": "string"}},
                        "abstract": {"type": "string"},
                        "doi": {"type": "string"},
                        "citations": {"type": "integer", "minimum": 0},
                        "journal": {"type": "string"},
                        "evidence_type": {
                            "type": "string",
                            "enum": [
                                "meta-analysis",
                                "systematic review",
                                "RCT",
                                "quasi-experimental",
                                "observational",
                                "case report",
                                "other",
                            ],
                        },
                    },
                },
            },
        },
        "required": ["topic", "papers"],
        "additionalProperties": False,
    },
}

BLOG_SCHEMA = {
    "name": "blog_post_v1",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "word_count": {"type": "integer"},
            "body_md": {"type": "string"},
            "references": {
                "type": "array",
                "minItems": 5,
                "maxItems": 5,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "index": {"type": "integer", "minimum": 1, "maximum": 5},
                        "title": {"type": "string"},
                        "authors": {"type": "array", "items": {"type": "string"}},
                        "journal": {"type": "string"},
                        "year": {"type": "integer"},
                        "doi": {"type": "string"},
                    },
                    "required": ["index", "title", "authors", "journal", "year", "doi"],
                },
            },
        },
        "required": ["title", "word_count", "body_md", "references"],
        "additionalProperties": False,
    },
}

# ============================================================================
# PROMPTS - Your existing prompts here
# ============================================================================

RESEARCH_PROMPT = """Role: meticulous research assistant.
Goal: Return EXACTLY five *real* papers for the given topic, conforming to the provided JSON Schema.

Selection rubric (optimize for blog storytelling and evidence quality):
  1) Evidence hierarchy: meta-analyses > RCTs > others.
  2) Prefer papers that report concrete outcome metrics (e.g., AUROC, sensitivity %, error reduction).
  3) Prefer papers with clear clinical settings and populations; geographic diversity is a plus.
  4) Avoid domain duplicates if possible (imaging, CDS, remote monitoring, surgery, admin ops).
  5) Fill ALL fields; be conservative with evidence_type when uncertain.
Return ONLY the structured result."""

BLOG_PROMPT = """You are a knowledgeable, friendly blog writer for a general online audience.

Output ONLY valid JSON matching the schema. No extra text.

STYLE & TONE:
- Conversational, second-person ("you"), approachable and clear.
- Short paragraphs (2–3 sentences), subheadings every ~120–150 words.
- Avoid jargon; define any necessary terms briefly and simply.
- Target reading level: roughly 8th–10th grade.

STRUCTURE inside body_md (Markdown):
1. Start with a compelling HOOK—an intriguing scenario, question, or statistic in the first 40–60 words.
2. Insert a **Key Takeaways** section (3–5 bullet points).
3. Add a "Real-World Spotlights" section: 3 brief, story-like vignettes tied to your research papers.
4. Include a **By the Numbers** callout: memorable statistics from the research.
5. Add a **Frequently Asked Questions** (FAQ) section: 3 Q&A entries.
6. Provide a "**What This Means for You**" section: 3 practical suggestions.
7. End with a **## References** list: numbered 1..n referencing the 'references' array.
8. Conclude with a one-sentence Call-to-Action.

CITATIONS:
- Use inline numeric citations [1]..[n] that map to items in "references".
- Do not invent sources; leave claims un-cited if no reference exists.

LENGTH:
- Target 900–1100 words total in the body_md."""

# ============================================================================
# HELPER FUNCTIONS - Your validation functions
# ============================================================================


def validate_doi_format(doi: str) -> bool:
    """Check DOI format roughly (does not verify existence)."""
    return bool(re.match(r"^10\.\d{4,9}/\S+$", doi.strip()))


def dedupe_by_title(items: List[Dict]) -> List[Dict]:
    """Return unique items by normalized title."""
    seen, out = set(), []
    for it in items:
        key = re.sub(r"\s+", " ", it["title"].strip().lower())
        if key not in seen:
            seen.add(key)
            out.append(it)
    return out


# ============================================================================
# MAIN FUNCTIONS - Core OpenAI API calls
# ============================================================================


def get_research_papers(topic: str) -> Dict[str, Any]:
    """
    Step 1: Get research papers using OpenAI
    """
    print(f"📚 Researching: {topic}")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": RESEARCH_PROMPT},
                {"role": "user", "content": topic},
            ],
            response_format={"type": "json_schema", "json_schema": RESEARCH_SCHEMA},
            max_completion_tokens=2000,
            temperature=0.7,
        )

        content = response.choices[0].message.content
        print(f"  🔍 Raw response length: {len(content)} characters")
        
        try:
            research_data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON Parse Error: {e}")
            print(f"  📄 Raw content (first 500 chars): {content[:500]}")
            raise Exception(f"Invalid JSON response from OpenAI: {e}")

        # Validate and deduplicate
        research_data["papers"] = dedupe_by_title(research_data["papers"])

        # Validate DOIs
        for paper in research_data["papers"]:
            paper["doi_valid"] = validate_doi_format(paper["doi"])
            if not paper["doi_valid"]:
                print(f"  ⚠️ Invalid DOI: {paper['doi']}")

        print(f"  ✓ Found {len(research_data['papers'])} papers")
        return research_data

    except Exception as e:
        print(f"  ❌ Error: {e}")
        raise


def generate_blog(research_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 2: Generate blog from research papers
    """
    print(f"✍️  Generating blog...")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": BLOG_PROMPT},
                {
                    "role": "user",
                    "content": f"Topic: {research_data['topic']}\n"
                    f"Research JSON:\n{json.dumps(research_data)}",
                },
            ],
            response_format={"type": "json_schema", "json_schema": BLOG_SCHEMA},
            max_completion_tokens=3200,
            temperature=0.7,
        )

        content = response.choices[0].message.content
        print(f"  🔍 Blog response length: {len(content)} characters")
        
        try:
            blog_data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"  ❌ Blog JSON Parse Error: {e}")
            print(f"  📄 Raw content (first 500 chars): {content[:500]}")
            raise Exception(f"Invalid JSON response from OpenAI during blog generation: {e}")
        print(f"  ✓ Generated {blog_data['word_count']} words")
        return blog_data

    except Exception as e:
        print(f"  ❌ Error: {e}")
        raise


def save_blog(blog_data: Dict[str, Any], topic: str) -> Path:
    """
    Step 3: Save blog to markdown file
    """
    # Create outputs directory
    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)

    # Generate filename
    filename = f"{topic.replace(' ', '-').lower()}.md"
    filepath = output_dir / filename

    # Save markdown content
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(blog_data["body_md"])

    print(f"💾 Saved to: {filepath}")
    return filepath


# ============================================================================
# MAIN EXECUTION
# ============================================================================


def create_blog(topic: str) -> Dict[str, Any]:
    """
    Complete blog creation pipeline
    """
    print("\n" + "=" * 50)
    print("🚀 AI RESEARCH BLOG GENERATOR")
    print("=" * 50 + "\n")

    try:
        # Step 1: Research
        research = get_research_papers(topic)

        # Step 2: Generate
        blog = generate_blog(research)

        # Step 3: Save
        filepath = save_blog(blog, topic)

        print("\n✅ Blog generation complete!")
        print(f"📄 Title: {blog['title']}")
        print(f"📊 Word count: {blog['word_count']}")
        print(f"📁 File: {filepath}")

        return blog

    except Exception as e:
        print(f"\n❌ Failed to generate blog: {e}")
        return None


if __name__ == "__main__":
    # Run the generator
    topic = input("Enter blog topic: ").strip()

    if topic:
        blog = create_blog(topic)
    else:
        print("❌ Please enter a valid topic")

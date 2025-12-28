#!/usr/bin/env python3
"""
REDDIT PAIN MINER - Single File Edition
========================================
Drop this into Replit and run. No setup required.

QUICK START:
  python main.py search "credit union" "frustrated OR legacy"
  python main.py preset credit_union_pain
  python main.py deep "https://reddit.com/r/smallbusiness/comments/..."
  python main.py analyze pain_signals.json "fintech"

PRESETS: credit_union_pain, smb_finance, saas_gaps, m_and_a_tools, automation_needs

For Claude analysis, add your API key in Replit Secrets:
  ANTHROPIC_API_KEY = sk-ant-...
"""

import urllib.request
import urllib.parse
import json
import sys
import os
import re
import time
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Optional

# ============================================================================
# CONFIGURATION - Edit these for your use case
# ============================================================================

PRESETS = {
    "credit_union_pain": {
        "subreddits": ["CreditUnions", "banking", "FinancialCareers", "smallbusiness"],
        "query": "credit union (frustrated OR nightmare OR stuck OR legacy OR outdated)"
    },
    "smb_finance": {
        "subreddits": ["smallbusiness", "Entrepreneur", "Bookkeeping", "accounting"],
        "query": "small business (accounting OR invoicing OR cashflow) (frustrated OR help OR nightmare)"
    },
    "saas_gaps": {
        "subreddits": ["SaaS", "startups", "Entrepreneur", "nocode", "smallbusiness"],
        "query": '"is there any" OR "looking for" (software OR tool OR app)'
    },
    "automation_needs": {
        "subreddits": ["Entrepreneur", "smallbusiness", "startups", "SaaS"],
        "query": "automate (how do I OR is there any) (workflow OR process OR manual)"
    },
    "m_and_a_tools": {
        "subreddits": ["mergersandacquisitions", "privateequity", "FinancialCareers"],
        "query": "due diligence (tool OR software OR automate OR manual)"
    }
}

# Pain signal patterns and their weights
PAIN_PATTERNS = {
    "buyer": (r"\b(willing to pay|budget for?|worth (the |paying)|invest in|purchase)\b", 5),
    "frustrated": (r"\b(frustrat|nightmare|terrible|awful|hate|sick of|annoying)\b", 4),
    "stuck": (r"\b(stuck|blocked|can't figure|struggling|lost|given up)\b", 3),
    "seeking": (r"\b(is there any|looking for|anyone know|recommend|suggest)\b", 2),
    "question": (r"^(how|what|why|is there|does anyone|can someone|where)", 1),
}

# ============================================================================
# REDDIT API (No Auth Required)
# ============================================================================

def reddit_search(query: str, subreddit: str = None, limit: int = 100, 
                  time_filter: str = "year") -> List[dict]:
    """Search Reddit using public JSON API. No authentication needed."""
    base = "https://www.reddit.com"
    url = f"{base}/r/{subreddit}/search.json" if subreddit else f"{base}/search.json"
    
    params = {
        "q": query,
        "sort": "relevance",
        "t": time_filter,
        "limit": min(limit, 100),
        "restrict_sr": "true" if subreddit else "false"
    }
    
    full_url = f"{url}?{urllib.parse.urlencode(params)}"
    headers = {"User-Agent": "PainMiner/1.0 (Startup Research)"}
    
    try:
        req = urllib.request.Request(full_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode())
            return data.get("data", {}).get("children", [])
    except Exception as e:
        print(f"  ⚠️ Error searching r/{subreddit}: {e}")
        return []


def get_thread(url: str) -> Optional[dict]:
    """Get full thread by adding .json to URL."""
    url = url.rstrip("/")
    if not url.endswith(".json"):
        url += ".json"
    
    headers = {"User-Agent": "PainMiner/1.0 (Startup Research)"}
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error: {e}")
        return None


def extract_comments(thread_data: list, max_depth: int = 5) -> List[dict]:
    """Recursively extract all comments from thread."""
    comments = []
    
    def process(comment_data, depth=0):
        if depth > max_depth or not isinstance(comment_data, dict):
            return
        data = comment_data.get("data", {})
        if data.get("body"):
            comments.append({
                "body": data["body"],
                "score": data.get("score", 0),
                "author": data.get("author", "[deleted]"),
                "depth": depth
            })
        replies = data.get("replies")
        if isinstance(replies, dict):
            for child in replies.get("data", {}).get("children", []):
                process(child, depth + 1)
    
    if len(thread_data) > 1:
        for comment in thread_data[1].get("data", {}).get("children", []):
            process(comment)
    
    return comments


# ============================================================================
# PAIN ANALYSIS
# ============================================================================

def analyze_text(text: str) -> dict:
    """Score text for pain signals."""
    text_lower = text.lower()
    signals = {}
    total = 0
    
    for name, (pattern, weight) in PAIN_PATTERNS.items():
        matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
        signals[name] = matches
        total += matches * weight
    
    signals["pain_score"] = min(total, 10)
    return signals


def mine_subreddits(query: str, subreddits: List[str], limit: int = 50) -> List[dict]:
    """Mine multiple subreddits for pain signals."""
    results = []
    seen = set()
    
    print(f"\n🔍 Query: {query}")
    print(f"📂 Subreddits: {', '.join(subreddits)}")
    print("-" * 60)
    
    for sub in subreddits:
        print(f"\n  Mining r/{sub}...", end=" ", flush=True)
        posts = reddit_search(query, subreddit=sub, limit=limit)
        count = 0
        
        for item in posts:
            post = item.get("data", {})
            pid = post.get("id")
            if pid in seen:
                continue
            seen.add(pid)
            
            text = f"{post.get('title', '')} {post.get('selftext', '')}"
            signals = analyze_text(text)
            
            results.append({
                "id": pid,
                "subreddit": post.get("subreddit"),
                "title": post.get("title"),
                "body": post.get("selftext", "")[:500],
                "score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "created": datetime.fromtimestamp(post.get("created_utc", 0)).isoformat(),
                "signals": signals
            })
            count += 1
        
        print(f"found {count}")
        time.sleep(1)  # Rate limiting
    
    results.sort(key=lambda x: x["signals"]["pain_score"], reverse=True)
    return results


# ============================================================================
# CLAUDE ANALYSIS (Optional)
# ============================================================================

def claude_analyze(signals: List[dict], niche: str) -> Optional[dict]:
    """Use Claude to analyze pain signals. Requires ANTHROPIC_API_KEY."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("\n⚠️  ANTHROPIC_API_KEY not set. Skipping AI analysis.")
        print("   Add it in Replit Secrets to enable.")
        return None
    
    print("\n🧠 Running Claude analysis...")
    
    # Format signals
    signals_text = "\n\n".join([
        f"POST #{i}: [{s['signals']['pain_score']}/10 pain]\n"
        f"r/{s['subreddit']}: {s['title']}\n"
        f"{s['body'][:300]}...\n"
        f"URL: {s['url']}"
        for i, s in enumerate(signals[:25], 1)
    ])
    
    prompt = f"""Analyze these Reddit posts for startup opportunities in {niche}:

{signals_text}

Return JSON:
{{
  "summary": "2-sentence opportunity summary",
  "top_opportunities": [
    {{
      "name": "product name",
      "problem": "one sentence problem",
      "target_user": "who has this problem",
      "mvp_features": ["feature1", "feature2", "feature3"],
      "pricing": "low/medium/high willingness to pay",
      "validation_test": "how to test demand this week",
      "confidence": 1-10
    }}
  ],
  "keywords": ["words these users actually use"],
  "next_steps": ["action 1", "action 2", "action 3"]
}}"""

    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps({
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}]
            }).encode(),
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01"
            }
        )
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode())
            text = result["content"][0]["text"]
            
            # Extract JSON
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                return json.loads(match.group())
            return {"raw": text}
    except Exception as e:
        print(f"  ⚠️ Claude error: {e}")
        return None


# ============================================================================
# OUTPUT
# ============================================================================

def print_results(results: List[dict], top_n: int = 15):
    """Pretty print top results."""
    print("\n" + "=" * 70)
    print("🎯 TOP PAIN SIGNALS")
    print("=" * 70)
    
    for i, r in enumerate(results[:top_n], 1):
        pain = r["signals"]["pain_score"]
        bar = "🔥" * min(pain, 5) + "⚪" * (5 - min(pain, 5))
        
        print(f"\n{i}. [{bar}] Pain: {pain}/10")
        print(f"   📌 {r['title'][:70]}...")
        print(f"   💬 r/{r['subreddit']} | ⬆{r['score']} | 💬{r['num_comments']}")
        print(f"   🔗 {r['url']}")


def save_results(results: List[dict], analysis: dict = None):
    """Save results to files."""
    with open("pain_signals.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Saved {len(results)} signals to pain_signals.json")
    
    if analysis:
        with open("opportunity_analysis.json", "w") as f:
            json.dump(analysis, f, indent=2)
        print("💾 Saved analysis to opportunity_analysis.json")


def generate_report(results: List[dict]) -> dict:
    """Generate summary report."""
    by_sub = defaultdict(list)
    for r in results:
        by_sub[r["subreddit"]].append(r)
    
    return {
        "total": len(results),
        "by_subreddit": {
            sub: {"count": len(posts), "avg_pain": sum(p["signals"]["pain_score"] for p in posts) / len(posts)}
            for sub, posts in by_sub.items()
        },
        "high_pain_count": len([r for r in results if r["signals"]["pain_score"] >= 5])
    }


# ============================================================================
# COMMANDS
# ============================================================================

def cmd_search(args):
    """Search with custom query."""
    if len(args) < 1:
        print("Usage: python main.py search <niche> [keywords]")
        print('Example: python main.py search "credit union" "frustrated OR legacy"')
        return
    
    niche = args[0]
    keywords = args[1] if len(args) > 1 else ""
    query = f"{niche} {keywords}".strip()
    
    # Default subreddits
    subs = ["smallbusiness", "Entrepreneur", "startups", "SaaS", "fintech"]
    
    results = mine_subreddits(query, subs)
    print_results(results)
    
    analysis = claude_analyze(results, niche)
    save_results(results, analysis)
    
    if analysis and "summary" in analysis:
        print("\n" + "=" * 70)
        print("📊 AI ANALYSIS")
        print("=" * 70)
        print(f"\n{analysis['summary']}")
        
        if "top_opportunities" in analysis:
            print("\nTop Opportunities:")
            for i, opp in enumerate(analysis["top_opportunities"][:3], 1):
                print(f"\n  {i}. {opp.get('name', 'Unnamed')}")
                print(f"     Problem: {opp.get('problem', 'N/A')}")
                print(f"     Confidence: {opp.get('confidence', '?')}/10")


def cmd_preset(args):
    """Run a preset search."""
    if len(args) < 1 or args[0] not in PRESETS:
        print("Available presets:")
        for name, config in PRESETS.items():
            print(f"  {name}: {config['query'][:50]}...")
        return
    
    preset = PRESETS[args[0]]
    results = mine_subreddits(preset["query"], preset["subreddits"])
    print_results(results)
    
    analysis = claude_analyze(results, args[0].replace("_", " "))
    save_results(results, analysis)
    
    if analysis and "summary" in analysis:
        print("\n" + "=" * 70)
        print("📊 AI ANALYSIS")
        print("=" * 70)
        print(f"\n{analysis['summary']}")


def cmd_deep(args):
    """Deep dive into a thread."""
    if len(args) < 1:
        print("Usage: python main.py deep <reddit_url>")
        return
    
    url = args[0]
    print(f"\n🔬 Deep diving: {url}")
    
    thread = get_thread(url)
    if not thread:
        return
    
    post = thread[0]["data"]["children"][0]["data"]
    comments = extract_comments(thread)
    
    print(f"\n📝 {post.get('title')}")
    print(f"   ⬆{post.get('score')} | 💬{post.get('num_comments')}")
    
    # Analyze comments
    pain_comments = []
    for c in comments:
        signals = analyze_text(c["body"])
        if signals["pain_score"] >= 3:
            c["signals"] = signals
            pain_comments.append(c)
    
    pain_comments.sort(key=lambda x: x["signals"]["pain_score"], reverse=True)
    
    print(f"\n🔥 Found {len(pain_comments)} high-pain comments out of {len(comments)}")
    print("-" * 60)
    
    for i, c in enumerate(pain_comments[:10], 1):
        print(f"\n{i}. [Pain: {c['signals']['pain_score']}] u/{c['author']} (⬆{c['score']})")
        print(f"   {c['body'][:200]}...")


def cmd_analyze(args):
    """Analyze existing signals file."""
    if len(args) < 2:
        print("Usage: python main.py analyze <signals.json> <niche>")
        return
    
    with open(args[0]) as f:
        signals = json.load(f)
    
    analysis = claude_analyze(signals, args[1])
    if analysis:
        print(json.dumps(analysis, indent=2))
        with open("opportunity_analysis.json", "w") as f:
            json.dump(analysis, f, indent=2)


# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nCOMMANDS:")
        print("  search <niche> [keywords]  - Custom search")
        print("  preset <name>              - Use preset search")
        print("  deep <url>                 - Analyze single thread")
        print("  analyze <file> <niche>     - AI analyze signals file")
        print("\nPRESETS:", ", ".join(PRESETS.keys()))
        print("\nEXAMPLES:")
        print('  python main.py search "credit union" "frustrated OR legacy"')
        print("  python main.py preset smb_finance")
        print("  python main.py deep https://reddit.com/r/smallbusiness/comments/...")
        return
    
    cmd = sys.argv[1].lower()
    args = sys.argv[2:]
    
    commands = {
        "search": cmd_search,
        "preset": cmd_preset,
        "deep": cmd_deep,
        "analyze": cmd_analyze,
    }
    
    if cmd in commands:
        commands[cmd](args)
    else:
        print(f"Unknown command: {cmd}")
        print("Commands: search, preset, deep, analyze")


if __name__ == "__main__":
    main()

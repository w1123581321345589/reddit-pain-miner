import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic (Replit Integration)
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// Pain Patterns (Ported from Python)
const PAIN_PATTERNS = {
  buyer: { regex: /\b(willing to pay|budget for?|worth (the |paying)|invest in|purchase)\b/i, weight: 5 },
  frustrated: { regex: /\b(frustrat|nightmare|terrible|awful|hate|sick of|annoying)\b/i, weight: 4 },
  stuck: { regex: /\b(stuck|blocked|can't figure|struggling|lost|given up)\b/i, weight: 3 },
  seeking: { regex: /\b(is there any|looking for|anyone know|recommend|suggest)\b/i, weight: 2 },
  question: { regex: /^(how|what|why|is there|does anyone|can someone|where)/i, weight: 1 },
};

function analyzeText(text: string) {
  let score = 0;
  const signals: Record<string, number> = {};

  for (const [key, { regex, weight }] of Object.entries(PAIN_PATTERNS)) {
    const matches = (text.match(regex) || []).length;
    signals[key] = matches;
    score += matches * weight;
  }
  
  return { score: Math.min(score, 10), signals };
}

async function fetchRedditPosts(subreddit: string, query: string) {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=50&restrict_sr=true`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PainMiner/1.0 (Startup Research)" }
    });
    if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);
    const data = await res.json();
    return data.data?.children?.map((child: any) => child.data) || [];
  } catch (err) {
    console.error(`Error fetching r/${subreddit}:`, err);
    return [];
  }
}

async function runSearch(searchId: number, query: string, subreddits: string[]) {
  try {
    console.log(`Starting search ${searchId} for query: ${query}`);
    let allPosts: any[] = [];

    // 1. Mine Subreddits
    for (const sub of subreddits) {
      const posts = await fetchRedditPosts(sub, query);
      for (const post of posts) {
        const text = `${post.title} ${post.selftext || ""}`;
        const { score, signals } = analyzeText(text);
        
        // Only keep if some pain signal found or valid text
        if (text.length > 20) {
            allPosts.push({
                searchId,
                redditId: post.id,
                subreddit: sub,
                title: post.title,
                body: (post.selftext || "").substring(0, 5000), // Limit body size
                score: post.score || 0,
                numComments: post.num_comments || 0,
                url: `https://reddit.com${post.permalink}`,
                painScore: score,
                signals,
                createdAt: new Date(post.created_utc * 1000),
            });
        }
      }
    }

    // Sort by pain score
    allPosts.sort((a, b) => b.painScore - a.painScore);
    const topPosts = allPosts.slice(0, 100); // Keep top 100

    // Save to DB
    for (const p of topPosts) {
      await storage.createPost(p);
    }

    // 2. AI Analysis
    const signalsText = topPosts.slice(0, 25).map((p, i) => 
      `POST #${i+1} [Pain: ${p.painScore}/10]\nr/${p.subreddit}: ${p.title}\n${p.body.substring(0, 300)}...`
    ).join("\n\n");

    const prompt = `Analyze these Reddit posts for startup opportunities. Return JSON only:
    {
      "summary": "2-sentence opportunity summary",
      "top_opportunities": [
        {
          "name": "product name",
          "problem": "one sentence problem",
          "target_user": "who has this problem",
          "pricing": "low/medium/high",
          "confidence": 1-10,
          "description": "brief description"
        }
      ]
    }
    
    POSTS:
    ${signalsText}`;

    let summary = "";
    
    if (signalsText) {
        try {
            const msg = await anthropic.messages.create({
                model: "claude-sonnet-4-5",
                max_tokens: 2000,
                messages: [{ role: "user", content: prompt }],
            });

            const content = msg.content[0].type === 'text' ? msg.content[0].text : "";
            // Extract JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                summary = result.summary;
                
                if (result.top_opportunities) {
                    for (const opp of result.top_opportunities) {
                        await storage.createOpportunity({
                            searchId,
                            name: opp.name,
                            problem: opp.problem,
                            targetUser: opp.target_user,
                            pricing: opp.pricing,
                            confidence: opp.confidence,
                            description: opp.description,
                        });
                    }
                }
            }
        } catch (err) {
            console.error("AI Analysis failed:", err);
            summary = "AI Analysis failed or timed out.";
        }
    } else {
        summary = "No posts found to analyze.";
    }

    await storage.updateSearchStatus(searchId, "completed", summary);
    console.log(`Search ${searchId} completed.`);

  } catch (err) {
    console.error(`Search ${searchId} failed:`, err);
    await storage.updateSearchStatus(searchId, "failed");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.searches.create.path, async (req, res) => {
    try {
      const input = api.searches.create.input.parse(req.body);
      const search = await storage.createSearch(input);
      
      // Trigger background search
      runSearch(search.id, input.query, input.subreddits).catch(console.error);
      
      res.status(201).json(search);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.searches.list.path, async (req, res) => {
    const list = await storage.listSearches();
    res.json(list);
  });

  app.get(api.searches.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const search = await storage.getSearch(id);
    if (!search) return res.status(404).json({ message: "Not found" });
    
    const posts = await storage.getPostsBySearchId(id);
    const opportunities = await storage.getOpportunitiesBySearchId(id);
    
    res.json({ ...search, posts, opportunities });
  });

  app.get(api.opportunities.list.path, async (req, res) => {
    const opps = await storage.listOpportunities();
    res.json(opps);
  });

  return httpServer;
}

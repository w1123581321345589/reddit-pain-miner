import { Layout } from "@/components/Layout";
import { useSearch } from "@/hooks/use-searches";
import { useRoute } from "wouter";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PainScoreChart } from "@/components/PainScoreChart";
import { OpportunityCard } from "@/components/OpportunityCard";
import { PostCard } from "@/components/PostCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SearchDetails() {
  const [, params] = useRoute("/searches/:id");
  const id = parseInt(params?.id || "0");
  const { data: search, isLoading, error } = useSearch(id);
  const [postSort, setPostSort] = useState<"pain" | "newest">("pain");

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-display font-bold">Analyzing Reddit Data...</h2>
          <p className="text-muted-foreground mt-2">This usually takes 10-20 seconds.</p>
        </div>
      </Layout>
    );
  }

  if (error || !search) {
    return (
      <Layout>
        <div className="h-[70vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-display font-bold text-destructive">Failed to load search</h2>
          <p className="text-muted-foreground mt-2 mb-6">{error?.message || "Search not found"}</p>
          <Link href="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </Layout>
    );
  }

  const posts = search.posts || [];
  const opportunities = search.opportunities || [];

  const sortedPosts = [...posts].sort((a, b) => {
    if (postSort === "pain") return b.painScore - a.painScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 text-foreground">
              Results: {search.query}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Searched in:</span>
              {search.subreddits.map(sub => (
                <span key={sub} className="bg-secondary px-2 py-0.5 rounded font-medium text-secondary-foreground">r/{sub}</span>
              ))}
            </div>
          </div>
          
          <div className={cn(
            "px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm",
            search.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
            search.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          )}>
            Status: {search.status}
          </div>
        </div>
      </div>

      {search.status === "pending" ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold font-display mb-2">Mining in Progress</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We are currently fetching posts, analyzing sentiment, and identifying pain points. 
            The results will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Summary Section */}
          {search.summary && (
            <section className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-display font-bold mb-4 text-primary">AI Analysis Summary</h2>
              <div className="prose dark:prose-invert max-w-none text-foreground/90">
                <p>{search.summary}</p>
              </div>
            </section>
          )}

          {/* Opportunities Section */}
          {opportunities.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center">
                <span className="bg-accent/10 text-accent p-2 rounded-lg mr-3">
                  <Loader2 className="w-6 h-6 animate-spin-slow" /> {/* Just a visual icon, not spinning usually but reusing for style */}
                </span>
                Identified Opportunities
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {opportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </section>
          )}

          {/* Posts & Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Posts List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Raw Pain Data</h2>
                <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
                  <button 
                    onClick={() => setPostSort("pain")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      postSort === "pain" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    High Pain
                  </button>
                  <button 
                    onClick={() => setPostSort("newest")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      postSort === "newest" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Newest
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sortedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {sortedPosts.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No high-pain posts found.</p>
                )}
              </div>
            </div>

            {/* Right Column: Chart & Stats */}
            <div className="space-y-6">
               <div className="sticky top-6">
                <h2 className="text-lg font-display font-bold mb-4">Pain Distribution</h2>
                <PainScoreChart posts={posts} />
                
                <div className="mt-6 bg-card border border-border rounded-2xl p-6">
                   <h3 className="font-bold text-lg mb-4 font-display">Data Stats</h3>
                   <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Analyzed</span>
                        <span className="font-bold">{posts.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">High Pain Posts</span>
                        <span className="font-bold text-accent">
                          {posts.filter(p => p.painScore > 70).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Pain Score</span>
                        <span className="font-bold">
                          {Math.round(posts.reduce((acc, p) => acc + p.painScore, 0) / (posts.length || 1))}
                        </span>
                      </div>
                   </div>
                </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

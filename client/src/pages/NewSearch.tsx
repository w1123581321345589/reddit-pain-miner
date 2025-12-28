import { Layout } from "@/components/Layout";
import { useCreateSearch } from "@/hooks/use-searches";
import { useLocation } from "wouter";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertSearchSchema, type InsertSearch } from "@shared/schema";
import { z } from "zod";
import { Loader2, Search, X, Plus } from "lucide-react";

// Schema for the form specifically (handling array as comma string for easier input if needed, but lets use chips)
const formSchema = insertSearchSchema.extend({
  // Override subreddits to be string array for validation
  subreddits: z.array(z.string()).min(1, "At least one subreddit is required"),
});

export default function NewSearch() {
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateSearch();
  const [subredditInput, setSubredditInput] = useState("");

  const form = useForm<InsertSearch>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      subreddits: [],
      status: "pending",
    },
  });

  const subreddits = form.watch("subreddits");

  const onSubmit = (data: InsertSearch) => {
    mutate(data, {
      onSuccess: (newSearch) => {
        setLocation(`/searches/${newSearch.id}`);
      },
    });
  };

  const addSubreddit = () => {
    const cleanSub = subredditInput.trim().replace(/^r\//, '');
    if (cleanSub && !subreddits.includes(cleanSub)) {
      form.setValue("subreddits", [...subreddits, cleanSub]);
      setSubredditInput("");
    }
  };

  const removeSubreddit = (subToRemove: string) => {
    form.setValue("subreddits", subreddits.filter(s => s !== subToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubreddit();
    }
  };

  const PRESETS = [
    { name: "SaaS Gaps", query: "frustrated OR 'how do I' OR 'looking for tool'", subs: ["SaaS", "Entrepreneur", "startups"] },
    { name: "SMB Finance", query: "payroll OR accounting OR 'too expensive'", subs: ["smallbusiness", "accounting", "bookkeeping"] },
    { name: "Dev Tools", query: "slow OR buggy OR 'hate configured'", subs: ["webdev", "devops", "programming"] },
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    form.setValue("query", preset.query);
    form.setValue("subreddits", preset.subs);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Start New Mining Operation</h1>
          <p className="text-muted-foreground">Define your niche and we'll scour Reddit for pain points.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Query Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                  {...form.register("query")}
                  placeholder="e.g. 'frustrated' OR 'broken' OR 'hate'"
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
              {form.formState.errors.query && (
                <p className="text-destructive text-sm">{form.formState.errors.query.message}</p>
              )}
            </div>

            {/* Subreddits Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Target Subreddits</label>
              <div className="flex space-x-2">
                <input
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. smallbusiness (Press Enter to add)"
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={addSubreddit}
                  className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {subreddits.map(sub => (
                  <span key={sub} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 animate-in zoom-in duration-200">
                    r/{sub}
                    <button type="button" onClick={() => removeSubreddit(sub)} className="ml-2 hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {subreddits.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No subreddits added yet.</span>
                )}
              </div>
               {form.formState.errors.subreddits && (
                <p className="text-destructive text-sm">{form.formState.errors.subreddits.message}</p>
              )}
            </div>

            {/* Presets */}
            <div className="pt-4 border-t border-border">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Or choose a preset:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="text-left px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
                  >
                    <div className="font-bold text-foreground mb-1">{preset.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{preset.subs.join(", ")}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-6 px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Initiating Mining...
                </>
              ) : (
                "Start Mining"
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

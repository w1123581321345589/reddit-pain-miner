import { Layout } from "@/components/Layout";
import { useSearches } from "@/hooks/use-searches";
import { useOpportunities } from "@/hooks/use-opportunities";
import { Link } from "wouter";
import { Plus, Search as SearchIcon, ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: searches, isLoading: searchesLoading } = useSearches();
  const { data: opportunities, isLoading: opportunitiesLoading } = useOpportunities();

  const isLoading = searchesLoading || opportunitiesLoading;

  // Calculate simple stats
  const totalSearches = searches?.length || 0;
  const totalOpportunities = opportunities?.length || 0;
  const pendingSearches = searches?.filter(s => s.status === 'pending').length || 0;

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">
          Welcome back, Hunter.
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to find your next SaaS idea?
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Total Searches</span>
            <SearchIcon className="w-5 h-5 text-primary opacity-70" />
          </div>
          <span className="text-4xl font-display font-bold text-foreground">{totalSearches}</span>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Identified Gaps</span>
            <TrendingUp className="w-5 h-5 text-accent opacity-70" />
          </div>
          <span className="text-4xl font-display font-bold text-foreground">{totalOpportunities}</span>
        </div>
        <Link href="/search/new" className="bg-primary hover:bg-primary/90 transition-colors p-6 rounded-2xl shadow-lg shadow-primary/25 flex flex-col justify-center items-center h-32 group cursor-pointer border border-primary/20">
          <div className="bg-white/20 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold font-display">Start New Mining</span>
        </Link>
      </div>

      {/* Recent Searches Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold font-display">Recent Operations</h2>
          <Link href="/search/new" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : searches?.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No searches yet.</p>
            <Link href="/search/new" className="text-primary font-bold hover:underline">Start your first search</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subreddits</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {searches?.slice(0, 5).map((search) => (
                  <tr key={search.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                      {search.query}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {search.subreddits.slice(0, 2).map(sub => (
                          <span key={sub} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            r/{sub}
                          </span>
                        ))}
                        {search.subreddits.length > 2 && (
                          <span className="text-xs text-muted-foreground self-center">+{search.subreddits.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        search.status === 'completed' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        search.status === 'failed' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      )}>
                        {search.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {search.createdAt && format(new Date(search.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/searches/${search.id}`} className="text-primary hover:text-primary/80 flex items-center justify-end">
                        View <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

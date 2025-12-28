import { Layout } from "@/components/Layout";
import { useOpportunities } from "@/hooks/use-opportunities";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Loader2, LightbulbOff } from "lucide-react";
import { Link } from "wouter";

export default function Opportunities() {
  const { data: opportunities, isLoading } = useOpportunities();

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-3">Saved Opportunities</h1>
        <p className="text-muted-foreground">
          All the potential startup ideas identified across your mining operations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !opportunities || opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-card border border-border rounded-2xl text-center">
          <LightbulbOff className="w-16 h-16 text-muted-foreground mb-6" />
          <h2 className="text-xl font-bold mb-2">No opportunities yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start a new mining operation to find gaps in the market.
          </p>
          <Link href="/search/new" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
            Start Mining
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </Layout>
  );
}

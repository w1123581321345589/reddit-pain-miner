import { type Opportunity } from "@shared/schema";
import { ArrowUpRight, Target, Coins, TrendingUp } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <div className="group bg-card hover:bg-card/80 border border-border hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-display font-bold text-xl text-foreground pr-8 leading-tight">
          {opportunity.name}
        </h3>
        <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
          {opportunity.confidence}% Match
        </div>
      </div>

      <p className="text-muted-foreground mb-6 line-clamp-3">
        {opportunity.problem}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Target User</span>
            <span className="text-sm font-medium">{opportunity.targetUser}</span>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Coins className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Pricing Model</span>
            <span className="text-sm font-medium">{opportunity.pricing}</span>
          </div>
        </div>
      </div>

      {opportunity.validationTest && (
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">Validation Test</span>
          </div>
          <p className="text-sm text-foreground/80 italic">
            "{opportunity.validationTest}"
          </p>
        </div>
      )}
    </div>
  );
}

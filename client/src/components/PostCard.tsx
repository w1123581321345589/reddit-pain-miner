import { type Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const painLevel = post.painScore > 70 ? "high" : post.painScore > 30 ? "med" : "low";

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide",
            painLevel === "high" && "pain-badge-high",
            painLevel === "med" && "pain-badge-med",
            painLevel === "low" && "pain-badge-low",
          )}>
            Pain Score: {post.painScore}
          </span>
          <span className="text-xs text-muted-foreground">
            r/{post.subreddit} • {formatDistanceToNow(new Date(post.createdAt))} ago
          </span>
        </div>
        <a 
          href={post.url} 
          target="_blank" 
          rel="noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <h4 className="font-display font-bold text-lg mb-2 text-foreground leading-snug">
        {post.title}
      </h4>
      
      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
        {post.body}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {post.score} Upvotes
          </span>
          <span className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            {post.numComments} Comments
          </span>
        </div>
      </div>
    </div>
  );
}

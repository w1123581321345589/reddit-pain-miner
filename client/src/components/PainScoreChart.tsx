import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type Post } from "@shared/schema";

interface PainScoreChartProps {
  posts: Post[];
}

export function PainScoreChart({ posts }: PainScoreChartProps) {
  // Group posts by pain score ranges
  const data = [
    { name: 'Low Pain (0-30)', count: 0, color: 'hsl(210, 80%, 60%)' },
    { name: 'Med Pain (31-70)', count: 0, color: 'hsl(30, 90%, 60%)' },
    { name: 'High Pain (71+)', count: 0, color: 'hsl(12, 76%, 61%)' },
  ];

  posts.forEach(post => {
    if (post.painScore <= 30) data[0].count++;
    else if (post.painScore <= 70) data[1].count++;
    else data[2].count++;
  });

  return (
    <div className="h-64 w-full bg-card rounded-2xl p-6 border border-border shadow-sm">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 font-display uppercase tracking-wider">Pain Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              borderRadius: '8px', 
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

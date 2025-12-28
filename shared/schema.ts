import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  subreddits: text("subreddits").array().notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  summary: text("summary"), // AI Summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id).notNull(),
  redditId: text("reddit_id").notNull(),
  subreddit: text("subreddit").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  score: integer("score").notNull(),
  numComments: integer("num_comments").notNull(),
  url: text("url").notNull(),
  painScore: integer("pain_score").notNull(),
  // JSONB for flexible signals storage if needed, but painScore is main one
  signals: jsonb("signals"), 
  createdAt: timestamp("created_at").notNull(), // Reddit creation time
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id).notNull(),
  name: text("name").notNull(),
  problem: text("problem").notNull(),
  targetUser: text("target_user").notNull(),
  pricing: text("pricing").notNull(),
  confidence: integer("confidence").notNull(),
  validationTest: text("validation_test"),
  description: text("description"), // Full description or extra details
  createdAt: timestamp("created_at").defaultNow(),
});

// schemas
export const insertSearchSchema = createInsertSchema(searches).omit({ 
  id: true, 
  createdAt: true, 
  status: true, 
  summary: true 
});
export const insertPostSchema = createInsertSchema(posts).omit({ id: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true });

// types
export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Post = typeof posts.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;

// Request types
export type CreateSearchRequest = InsertSearch;

// API Response types
export type SearchWithResults = Search & {
  posts?: Post[];
  opportunities?: Opportunity[];
};

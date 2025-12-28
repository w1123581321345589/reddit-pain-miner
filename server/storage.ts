import { db } from "./db";
import { searches, posts, opportunities, type InsertSearch, type Search, type Post, type Opportunity } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createSearch(search: InsertSearch): Promise<Search>;
  getSearch(id: number): Promise<Search | undefined>;
  listSearches(): Promise<Search[]>;
  updateSearchStatus(id: number, status: string, summary?: string): Promise<void>;
  
  createPost(post: typeof posts.$inferInsert): Promise<Post>;
  getPostsBySearchId(searchId: number): Promise<Post[]>;
  
  createOpportunity(opp: typeof opportunities.$inferInsert): Promise<Opportunity>;
  getOpportunitiesBySearchId(searchId: number): Promise<Opportunity[]>;
  listOpportunities(): Promise<Opportunity[]>;
}

export class DatabaseStorage implements IStorage {
  async createSearch(search: InsertSearch): Promise<Search> {
    const [newSearch] = await db.insert(searches).values(search).returning();
    return newSearch;
  }

  async getSearch(id: number): Promise<Search | undefined> {
    const [search] = await db.select().from(searches).where(eq(searches.id, id));
    return search;
  }

  async listSearches(): Promise<Search[]> {
    return await db.select().from(searches).orderBy(desc(searches.createdAt));
  }

  async updateSearchStatus(id: number, status: "pending" | "completed" | "failed", summary?: string): Promise<void> {
    await db.update(searches)
      .set({ status, summary })
      .where(eq(searches.id, id));
  }

  async createPost(post: typeof posts.$inferInsert): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPostsBySearchId(searchId: number): Promise<Post[]> {
    return await db.select()
      .from(posts)
      .where(eq(posts.searchId, searchId))
      .orderBy(desc(posts.painScore));
  }

  async createOpportunity(opp: typeof opportunities.$inferInsert): Promise<Opportunity> {
    const [newOpp] = await db.insert(opportunities).values(opp).returning();
    return newOpp;
  }

  async getOpportunitiesBySearchId(searchId: number): Promise<Opportunity[]> {
    return await db.select()
      .from(opportunities)
      .where(eq(opportunities.searchId, searchId))
      .orderBy(desc(opportunities.confidence));
  }

  async listOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
  }
}

export const storage = new DatabaseStorage();

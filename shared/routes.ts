import { z } from 'zod';
import { insertSearchSchema, searches, posts, opportunities } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  searches: {
    create: {
      method: 'POST' as const,
      path: '/api/searches',
      input: insertSearchSchema,
      responses: {
        201: z.custom<typeof searches.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/searches',
      responses: {
        200: z.array(z.custom<typeof searches.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/searches/:id',
      responses: {
        200: z.custom<typeof searches.$inferSelect & { posts: typeof posts.$inferSelect[], opportunities: typeof opportunities.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  opportunities: {
    list: {
      method: 'GET' as const,
      path: '/api/opportunities',
      responses: {
        200: z.array(z.custom<typeof opportunities.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

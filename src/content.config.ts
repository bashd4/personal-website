import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string(),
    outcome: z.string(),
    date: z.coerce.date(),
    order: z.number().default(0),
    link: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    quote: z.string(),
    author: z.string().default('Ben'),
    order: z.number().default(0),
  }),
});

export const collections = { projects, essays, quotes };

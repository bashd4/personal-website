import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string().max(120), // flows into OG description + card; keep it short
    outcome: z.string().max(200),
    date: z.coerce.date(),
    order: z.number().default(0),
    link: z.string().url().startsWith('https://').optional(),
    draft: z.boolean().default(false),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    quote: z.string(),
    author: z.string().min(1).default('Ben'),
    order: z.number().default(0),
  }),
});

export const collections = { projects, essays, quotes };

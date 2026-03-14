import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const receitas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/receitas' }),
  schema: z.object({
    title: z.string(),
    categoria: z.enum(['low-carb', 'bolos', 'tortas', 'mousses', 'muffins']),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { receitas };

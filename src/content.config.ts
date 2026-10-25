import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tier: z.enum(["featured", "secondary"]),
    order: z.number(),
    tags: z.array(z.string()),
    scope: z.enum(["2x2", "3x3", "4x4", "5x5"]).optional(),
    status: z.string().optional(),
    repo: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const books = defineCollection({
	loader: file('./src/content/books.yaml'),
	schema: z.object({
		title: z.string(),
		author: z.string().optional(),
		type: z.enum(['book', 'series']),
		yearRead: z.number().optional(),
		inProgress: z.boolean().optional(),
		notes: z.string().optional(),
		isbn: z.string().optional(),
		cover: z.string().url().optional(),
		genres: z.array(z.string()).optional(),
		books: z.array(z.object({
			title: z.string(),
			unread: z.boolean().optional(),
			inProgress: z.boolean().optional(),
			isbn: z.string().optional(),
		})).optional(),
	}),
});

const media = defineCollection({
	loader: file('./src/content/media.yaml'),
	schema: z.object({
		title: z.string(),
		author: z.string().optional(),
		type: z.enum(['blog', 'video', 'podcast', 'other']),
		url: z.string().url().optional(),
		image: z.string().url().optional(),
		addedDate: z.coerce.date().optional(),
		notes: z.string().optional(),
	}),
});

export const collections = { blog, books, media };
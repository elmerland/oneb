// @ts-check

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import { defineConfig } from 'astro/config';
import rehypeFigure from './src/plugins/rehype-figure.ts';

export default defineConfig({
	site: 'https://oneb.blog',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				if (/\/blog\/.+/.test(item.url)) {
					item.changefreq = 'monthly';
					item.priority = 0.8;
				} else {
					item.changefreq = 'weekly';
					item.priority = 0.6;
				}
				return item;
			},
		}),
	],
	markdown: {
		processor: unified({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeFigure] }),
	},
});

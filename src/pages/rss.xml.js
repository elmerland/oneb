import { getPublishedPosts } from '../lib/blog.ts';
import rss from '@astrojs/rss';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import sanitizeHtml from 'sanitize-html';
import { unified } from 'unified';
import { EMAIL, SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeStringify);

async function renderMarkdown(body) {
	const result = await processor.process(body ?? '');
	return sanitizeHtml(String(result), {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
}

export async function GET(context) {
	const posts = (await getPublishedPosts())
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const items = await Promise.all(
		posts.map(async (post) => {
			if (post.id.endsWith('.mdx')) {
				throw new Error(`RSS content rendering is not supported for MDX posts: ${post.id}`);
			}
			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/blog/${post.id}/`,
				customData: `<author>${EMAIL} (Elmer)</author>`,
				content: await renderMarkdown(post.body),
			};
		})
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		customData: `<language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
		items,
	});
}

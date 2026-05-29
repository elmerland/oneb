# oneb — Personal Blog

Personal blog for past and ongoing projects. Deployed on Cloudflare Pages.

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Bun](https://bun.sh).

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `bun install`     | Install dependencies                        |
| `bun run dev`     | Start local dev server at `localhost:4321`  |
| `bun run build`   | Build production site to `./dist/`          |
| `bun run preview` | Preview built output locally                |
| `bun run books`   | Regenerate `src/content/books.yaml`         |
| `bun run media`   | Fill in favicon images for media entries    |

## Structure

```
src/
  assets/         # images and fonts (processed by Astro/Sharp)
  components/     # BaseHead, Header, Footer, etc.
  content/
    blog/         # .md and .mdx posts
    books.yaml    # generated — edit scripts/fetch-book-metadata.ts instead
    media.yaml    # edit by hand
  layouts/
    BlogPost.astro
  pages/
    index.astro
    about.astro
    library.astro
    blog/[...slug].astro
    rss.xml.js
  styles/
    global.css
  consts.ts
  content.config.ts
scripts/
  fetch-book-metadata.ts   # source of truth for the books list
  fetch-media-metadata.ts  # fills in favicon images for media entries
```

## Content

### Blog posts

Add `.md` or `.mdx` files to `src/content/blog/`. Required frontmatter:

```yaml
---
title: string
description: string
pubDate: Date
updatedDate: Date   # optional
heroImage: image()  # optional
---
```

### Books

Edit the `BOOKS` array in `scripts/fetch-book-metadata.ts`, then run:

```bash
bun run books
```

### Media

Edit `src/content/media.yaml` by hand, then run:

```bash
bun run media
```

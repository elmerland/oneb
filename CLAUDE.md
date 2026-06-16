# oneb — Personal Blog

Personal blog for past and ongoing projects. Deployed on Cloudflare Pages.

## Tech Stack

| Tool | Role |
|------|------|
| Astro 6 | Framework |
| Bun | Package manager + runtime |
| Tailwind CSS 4 + @tailwindcss/typography | Styling |
| Shiki | Syntax highlighting (via Astro's built-in markdown config) |
| Sharp | Image processing |
| @astrojs/mdx | MDX support |
| @astrojs/rss | RSS feed |
| @astrojs/sitemap | Sitemap |
| @astrojs/cloudflare | Cloudflare Pages adapter |
| Cloudflare Web Analytics | Analytics (script tag, no package) |

## Commands

```bash
bun run dev      # local dev server
bun run build    # production build → dist/
bun run preview  # preview the built output
bun run deploy   # build + deploy to Cloudflare Pages (see below)
```

## Deploying

Run `bun run deploy` (wraps `scripts/deploy.sh`). The script:
1. Aborts if there are uncommitted changes or the HEAD hasn't been pushed to remote.
2. Runs `bun run build` and deploys via `wrangler pages deploy --branch main`.
3. Tags the commit `deploy/YYYYMMDD-HHMMSS` and creates a GitHub release.

**Always commit and push before deploying.**

## Deploy Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Authentication error [code: 10000]` | Wrangler session expired | Run `wrangler login` |
| `Failed to automatically retrieve account IDs` | Same expired auth | Run `wrangler login` |
| `Error: uncommitted changes present` | Dirty working tree | Commit or stash changes first |
| `Error: current commit has not been pushed to remote` | Local commit not on remote | `git push` before deploying |

## Source Structure

```
src/
  assets/         # images, fonts (processed by Sharp/Astro)
  components/     # BaseHead.astro, Header.astro, Footer.astro, etc.
  content/
    blog/         # .md and .mdx posts (frontmatter schema in content.config.ts)
  layouts/
    BlogPost.astro
  pages/
    index.astro
    about.astro
    blog/[...slug].astro
    blog/index.astro
    rss.xml.js
  styles/
    global.css
  consts.ts       # SITE_TITLE, SITE_DESCRIPTION
  content.config.ts  # blog collection schema
```

## Post Frontmatter Schema

```yaml
---
title: string          # required
description: string    # required
pubDate: Date          # required
updatedDate: Date      # optional
heroImage: image()     # optional
draft: boolean         # optional; true hides post from listings
---
```

## Design Reference

**Before writing or modifying any visual component — layouts, pages, typography, spacing,
color, or UI elements — read the design guidelines and implement to match them faithfully.**

| File | Purpose |
|------|---------|
| `docs/ui-guidelines.html` | Single source of truth: palette, type scale, layout, all components, usage rules, CSS tokens |

The guidelines document is a self-contained HTML file that demonstrates every component
live as it describes it. Open it in a browser or read the source directly. The file
mirrors the actual implementation in `src/styles/global.css` — if the two ever diverge,
trust `global.css` and update the guidelines.

Key facts to remember without reading:
- **Three typefaces**: IBM Plex Mono (UI chrome), IBM Plex Sans (post titles + prose headings), IBM Plex Serif (prose body + summaries)
- **Type scale**: CSS custom properties off `--fs-base: 1rem` — never hard-code px sizes
- **Content max**: `760px` · gutter: `clamp(20px, 5vw, 56px)` · mobile breakpoint: `720px`
- **Borders**: always `1.5px solid var(--plate)` · shadows always hard offset down-right
- **Accents**: 5 CRT colors in fixed positional order (red → cyan → yellow → plum → green); one per element, never paired

## Library Content

Books and media live in separate files:

- `scripts/fetch-book-metadata.ts` — **source of truth for books**. Edit the `BOOKS` array at the top of the file. Each entry has `title` (required), plus optional `yearRead`, `inProgress`, `isbn`, `series`, and `seriesPosition` fields. `series`/`seriesPosition` override what Open Library returns; `isbn` is used as the search key instead of the title.
- `src/content/books.yaml` — **generated output**; do not edit by hand.
- `src/content/media.yaml` — edit by hand; entries are displayed in file order. Fields: `id`, `title`, `type` (blog | video | podcast | other), plus optional `author`, `url`, `image`, `addedDate`, `notes`. Run the script below after adding entries to fill in `image`.
- `scripts/fetch-media-metadata.ts` — fills in the `image` field for any media entry that has a `url` but no `image`, using Google's favicon service. Existing `image` values are not overwritten (safe for manual overrides).

**After editing the `BOOKS` array, regenerate `books.yaml` by running:**

```bash
bun run books
```

The script fetches ISBN/cover/genres/author from Open Library for each book, groups books into series, and writes `books.yaml` from scratch. Safe to re-run at any time.

**After adding media entries, fill in favicon images by running:**

```bash
bun run media
```

## Key Conventions

- Use Bun, not npm or pnpm, for all package management
- Prefer `.astro` components; use `.mdx` only when interactive components are needed in posts
- Images go in `src/assets/` (Astro optimizes them); static files with no processing go in `public/`
- To add a caption to an image, use the Markdown title syntax: `![alt text](image.jpg "Caption text")` — the `rehype-figure` plugin converts this into a `<figure>` + `<figcaption>` pair
- Keep global styles in `src/styles/global.css`; component-scoped styles in `<style>` blocks
- `site` in `astro.config.mjs` must be set to the real production URL before deploying (currently placeholder)

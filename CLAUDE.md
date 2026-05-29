# oneb — Personal Blog

Personal blog for past and ongoing projects. Deployed on Cloudflare Pages.

## Tech Stack

| Tool | Role | Status |
|------|------|--------|
| Astro 6 | Framework | ✅ configured |
| Bun | Package manager + runtime | ✅ configured |
| Tailwind CSS 4 + @tailwindcss/typography | Styling | ⚠️ installed, not yet wired into `astro.config.mjs` |
| Shiki | Syntax highlighting (via Astro's built-in markdown config) | ⚠️ not yet configured |
| Sharp | Image processing | ✅ installed |
| @astrojs/mdx | MDX support | ✅ configured |
| @astrojs/rss | RSS feed | ✅ installed (`src/pages/rss.xml.js`) |
| @astrojs/sitemap | Sitemap | ✅ configured |
| @astrojs/cloudflare | Cloudflare Pages adapter | ⚠️ installed, not yet added to `astro.config.mjs` |
| Cloudflare Web Analytics | Analytics (script tag, no package) | ⚠️ not yet added to `BaseHead.astro` |

## Commands

```bash
bun run dev      # local dev server
bun run build    # production build → dist/
bun run preview  # preview the built output
```

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
---
```

## Design Reference

The visual style guide lives in `.claude/visual-identity/`. **Before writing or modifying
any visual component — layouts, pages, typography, spacing, color, or UI elements — read
the relevant files below and implement to match them faithfully.**

| File | Purpose |
|------|---------|
| `.claude/visual-identity/theme.html` | Core visual theme: colors, typography, design tokens |
| `.claude/visual-identity/look_and_feel_manual.html` | Overall aesthetic direction and style rules |
| `.claude/visual-identity/viewport_reference.html` | Layout behavior across viewport sizes |

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
- Keep global styles in `src/styles/global.css`; component-scoped styles in `<style>` blocks
- `site` in `astro.config.mjs` must be set to the real production URL before deploying (currently placeholder)

```
  ████████  ██     ██  ████████  ██████
 ██      ██ ███    ██ ██        ██    ██
 ██      ██ ██ ██  ██ ██████    ██████
 ██      ██ ██  ██ ██ ██        ██    ██
 ██      ██ ██   ████ ██        ██    ██
  ████████  ██    ███  ████████ ██████  ●
```
<i>A personal <sub>we</sub>blog — like a journal, but the typos are public.</i> 


Personal blog for past and ongoing projects. Deployed on Cloudflare Pages.  
Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Bun](https://bun.sh).

---

## Tech Stack

### Core Framework

| Tool | Version | Role |
| :--- | :------ | :--- |
| [Astro](https://astro.build) | `^6.4` | Static site framework |
| [Bun](https://bun.sh) | runtime | Package manager and script runner (replaces Node/npm) |
| [TypeScript](https://typescriptlang.org) | built-in via Astro | Type checking |

### Styling

| Tool | Version | Role |
| :--- | :------ | :--- |
| [Tailwind CSS v4](https://tailwindcss.com) | `^4.3` | Utility-first CSS (v4 — no `tailwind.config.*` needed) |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | `^0.5` | Prose styles for Markdown content |
| [@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) | `^6.0` | Astro integration for Tailwind |
| [IBM Plex Mono](https://fontsource.org/fonts/ibm-plex-mono) | `^5.2` | Primary typeface (monospace, self-hosted via Fontsource) |

Global design tokens (colors, spacing, shadows) live in `src/styles/global.css`.

### Astro Integrations

| Integration | Version | Role |
| :---------- | :------ | :--- |
| [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | `^5.0` | MDX support for interactive content in posts |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) | `^4.0` | `/rss.xml` feed |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | `^3.7` | Auto-generated sitemap |
| [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) | `^13.5` | Cloudflare Pages adapter |

### Markdown / Content

| Tool | Version | Role |
| :--- | :------ | :--- |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | `^4.0` | GitHub Flavored Markdown (tables, strikethrough, etc.) |
| [@astrojs/markdown-remark](https://github.com/withastro/astro) | `^7.2` | Astro's Markdown processor (unified/remark pipeline) |
| [sharp](https://sharp.pixelplumbing.com) | `^0.34` | Image optimization at build time |

### Deployment

| Tool | Version | Role |
| :--- | :------ | :--- |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | `^4.95` | Cloudflare Pages deploy CLI |
| [GitHub CLI (`gh`)](https://cli.github.com) | system | Creates GitHub release after each deploy |

### Utility / Scripts

| Tool | Version | Role |
| :--- | :------ | :--- |
| [js-yaml](https://github.com/nodeca/js-yaml) | `^4.1` | YAML parsing in build scripts |
| [sanitize-html](https://github.com/apostrophecms/sanitize-html) | `^2.17` | HTML sanitisation in content scripts |
| [canvas](https://github.com/Automattic/node-canvas) | `^3.2` | Node Canvas for server-side image generation |
| [linkinator](https://github.com/JustinBeckwith/linkinator) | `^7.6` | Broken-link checker (`bun run links`) |

---

## Project Structure

```
src/
  assets/             # Images and fonts (processed by Astro/Sharp)
  components/         # .astro components (BaseHead, Header, Footer, etc.)
  content/
    blog/             # .md and .mdx posts
    books.yaml        # Generated — do not edit by hand
    media.yaml        # Edit by hand
  layouts/
    BlogPost.astro
  pages/
    index.astro
    about.astro
    blog/[...slug].astro
    blog/index.astro
    rss.xml.js
  styles/
    global.css        # Design tokens, reset, base typography
  consts.ts           # SITE_TITLE, SITE_DESCRIPTION, taglines, links
  content.config.ts   # Zod schemas for blog, books, and media collections
scripts/
  deploy.sh           # Build + deploy guard script
  fetch-book-metadata.ts   # Pulls book data from Open Library → books.yaml
  fetch-media-metadata.ts  # Fills favicon images for media entries
public/               # Static assets (no processing)
astro.config.mjs      # Astro config (integrations, markdown pipeline)
wrangler.toml         # Cloudflare Pages project config
```

---

## Commands

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `bun install`     | Install dependencies                             |
| `bun run dev`     | Start local dev server at `localhost:4321`       |
| `bun run build`   | Build production site to `./dist/`               |
| `bun run preview` | Preview built output locally                     |
| `bun run books`   | Regenerate `src/content/books.yaml` from Open Library |
| `bun run media`   | Fill in favicon images for media entries         |
| `bun run links`   | Check for broken links across the live site      |
| `bun run deploy`  | Build and deploy to Cloudflare Pages             |

---

## Deploying

### Prerequisites

1. **Cloudflare account** with a Pages project created.
2. **Wrangler authenticated** — run `wrangler login` if needed.
3. **GitHub CLI authenticated** — run `gh auth login` if needed.
4. `wrangler.toml` points to your Pages project (`name = "your-project"`).
5. `site` in `astro.config.mjs` is set to your production URL.

### Deploy

Commit and push your changes first, then:

```bash
bun run deploy
```

The script (`scripts/deploy.sh`) will:

1. Abort if there are uncommitted changes.
2. Abort if the current commit hasn't been pushed to the remote.
3. Abort if Wrangler is not authenticated.
4. Run `bun run build`.
5. Deploy `./dist/` to Cloudflare Pages on the `main` branch.
6. Tag the commit `deploy/YYYYMMDD-HHMMSS` and push the tag.
7. Create a GitHub release from that tag with auto-generated notes.

### Troubleshooting

| Error | Cause | Fix |
| :---- | :---- | :-- |
| `Authentication error [code: 10000]` | Wrangler session expired | Run `wrangler login` |
| `Failed to automatically retrieve account IDs` | Same expired auth | Run `wrangler login` |
| `Error: uncommitted changes present` | Dirty working tree | Commit or stash first |
| `Error: current commit has not been pushed to remote` | Unpushed commit | `git push` then retry |

---

## Content

### Blog Posts

Add `.md` or `.mdx` files to `src/content/blog/`. MDX is only needed when embedding interactive components; plain Markdown is preferred otherwise.

### Books

Edit the `BOOKS` array in `scripts/fetch-book-metadata.ts`, then regenerate:

```bash
bun run books
```

The script fetches cover art, genres, and author info from Open Library and writes `src/content/books.yaml` from scratch.

### Media

Edit `src/content/media.yaml` by hand (entries render in file order), then fill in missing favicon images:

```bash
bun run media
```
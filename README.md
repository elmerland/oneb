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

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `bun install`     | Install dependencies                        |
| `bun run dev`     | Start local dev server at `localhost:4321`  |
| `bun run build`   | Build production site to `./dist/`          |
| `bun run preview` | Preview built output locally                |
| `bun run books`   | Regenerate `src/content/books.yaml`         |
| `bun run media`   | Fill in favicon images for media entries    |
| `bun run deploy`  | Build and deploy to Cloudflare Pages        |

## Deploying

Commit and push your changes first, then:

```bash
bun run deploy
```

The script will refuse to run if there are uncommitted changes or if the current commit hasn't been pushed. On success it builds the site, deploys to Cloudflare Pages, tags the commit (`deploy/YYYYMMDD-HHMMSS`), and creates a GitHub release.

## Content

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

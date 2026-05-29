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

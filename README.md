# Bee — Raw Honey

A static website for **Bee**, a raw honey brand: *Made by bees. Shared by people.*

## Pages
| File | Page |
|---|---|
| `index.html` | Home: live honey hero, rituals, products, tasting band |
| `story.html` | Our Story: manifesto, timeline, promises, apiaries |
| `products.html` | Shop: choose by moment, product view, gift notes, compare |
| `tasting.html` | Tasting guide: colour scale, ritual, flavour wheel, pairings, notebook |
| `sustainability.html` | Hive map, promises, price breakdown, jar tracing, plants for bees |

## Shared scripts
- `motion.js`: loading screen, honey page transitions (WebGL), smooth scrolling, reveals, cursor
- `bee.js`: the honeybee that flies across every page. It draws `img/bee-sprite.webp`, 27 frames pre-rendered from the full-detail 3D model (110 KB), so no 3D engine is needed at runtime
- `vendor/lenis.min.js`: smooth scrolling

No build step. Plain HTML, CSS and JavaScript.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on Vercel
1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** this repository.
3. Framework preset: **Other**. Build command: *none*. Output directory: `./` (root).
4. Deploy. Then add your domain under **Settings → Domains**.

`vercel.json` sets long cache times for images, models and libraries.

## Content notes
Story details, prices, hive counts, keeper details and lid codes are placeholder copy. Replace them with real figures before launch.

# Maccarruni — Osteria, Pizzeria, Wine Bar

Website concept for Maccarruni, Via San Giuseppe al Duomo 19, Catania.

Static site: plain HTML, CSS and JavaScript, no build step.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 4173
```

## Edit it

| What | Where |
|---|---|
| Dishes, descriptions, prices, fixed-price menu | `menu-data.js` |
| Texts (Italian and English) | `data-it` / `data-en` attributes in `index.html` |
| Colours and typography | variables at the top of `styles.css` |
| Background slideshow photos | `.bg__slide` entries in `index.html`, files in `assets/img/` |
| Hero film | save a clip in `assets/video/` and set `HERO_VIDEO` at the top of `menu-data.js` |
| Phone layout | the `Phones and small tablets` block at the end of `styles.css` |

## Before going live

- Confirm the prices marked `null` in `menu-data.js` and add starters, pizzas and the wine list.
- Replace the photos with the restaurant's own (or ones it has the rights to use).
- Confirm opening hours, phone numbers and what the menu asterisks mean.

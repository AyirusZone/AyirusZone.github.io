# Suriya Rajan — Portfolio

A static, dependency-free personal site (HTML, CSS, vanilla JavaScript). No build step, no third-party requests: fonts are self-hosted and there are no cookies or analytics.

## What's in the repo

| Path | Purpose |
|---|---|
| `index.html` | All content and markup, plus SEO metadata and schema.org JSON-LD |
| `css/main.css` | Design tokens (light and dark), layout, components and the print stylesheet |
| `css/visuals.css` | Ambient background, hero layers, marquee, result bars, platform map, career timeline |
| `script.js` | Theme toggle (follows the system setting, remembers the choice) and the Experience meter |
| `js/visuals.js` | Hero data-stream canvas, scroll reveals and count-ups, platform tabs, career timeline |
| `fonts/` | Bricolage Grotesque, Instrument Sans and IBM Plex Mono (Latin subsets, WOFF2) |
| `og-image.jpg` | Social share image (1200 × 630) |
| `Suriya_Rajan_Resume.pdf` | The download linked from the page |

## Host on GitHub Pages

1. In the repo go to **Settings → Pages → Build and deployment**.
2. Set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then Save.
3. The site goes live within a minute or two.

## Edit content

- **Text:** everything is in `index.html`. Results bars use `--v` values (0–100) and are indexed to 100 unless a unit is shown.
- **Experience meter:** counts from the date set in `script.js` (`START`). The career timeline reads its dates from `js/visuals.js`.
- **Colours and spacing:** tokens at the top of `css/main.css`.
- **Resume:** replace `Suriya_Rajan_Resume.pdf`, keeping the same file name.

## Accessibility and motion

Respects `prefers-reduced-motion` and `prefers-color-scheme`. Platform map tabs support Arrow, Home and End keys. If the visuals script fails to load, all content stays visible.

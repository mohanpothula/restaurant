# Maison Lumière

A single-page restaurant booking website for **Maison Lumière**, a fictional upscale French fine-dining restaurant located at 12 Duxton Hill, Singapore. Built with pure vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

## Live Demo

[https://mohanpothula.github.io/restaurant/](https://mohanpothula.github.io/restaurant/)

![screenshot](screenshot.png)
> Replace `screenshot.png` with an actual screenshot of the site.

---

## Features

- **Sticky navigation** — transparent on load, solid charcoal background after 60 px of scroll
- **Mobile-first responsive layout** — breakpoints at 768 px and 480 px; hamburger menu with full-screen overlay
- **Keyboard & accessibility** — ARIA labels, roles, `aria-expanded`, Escape-key close for mobile nav, screen-reader-only text, semantic HTML5 throughout
- **Scroll-triggered fade-ins** — `IntersectionObserver` animates every `.fade-in` element into view
- **Testimonial carousel** — previous/next buttons, dot navigation, pixel-based `translateX` with a `resize` listener to prevent reflow glitches
- **Reservation form** — full client-side validation: required fields, email regex, phone check, guests 1–20, date must be today or later, time dropdown with lunch/dinner service groups; confirmation message on valid submit
- **Google Fonts** — Playfair Display (display serif) + Montserrat (UI sans), loaded with `preconnect` for fast rendering
- **Unsplash CDN images** — nine dish photos loaded lazily at runtime (internet connection required)
- **GitHub Actions CI/CD** — automatic deployment to GitHub Pages on every push to `main`

---

## Sections

| Section | Content |
|---------|---------|
| `#hero` | Full-viewport parallax hero with tagline and CTA |
| `#menu` | Three categories — Entrées, Plats Principaux, Desserts — 9 dishes total |
| `#testimonials` | Three guest review cards in an auto-adapting carousel |
| `#reservations` | Table booking form (name, email, phone, guests, date, time, special requests) |
| `#footer` | Address, opening hours, social links |

---

## Getting Started

No build step required — open directly in a browser:

```bash
# Windows
start index.html

# macOS / Linux
open index.html

# Local server (avoids CORS issues with background-attachment: fixed)
npx serve .
python -m http.server 8080
```

---

## Project Structure

```
├── index.html          # Page structure and all content
├── styles.css          # All styling; CSS custom properties at top of :root
├── script.js           # Single IIFE — nav, mobile menu, fade-ins, carousel, form
├── 404.html            # GitHub Pages custom 404 → redirects to site root
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions — deploy to GitHub Pages on push to main
```

---

## Design Tokens (`styles.css :root`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--clr-dark` | `#1a1a1a` | Body/nav dark background |
| `--clr-charcoal` | `#2c2c2c` | Scrolled nav, footer |
| `--clr-cream` | `#f5f0e6` | Section backgrounds |
| `--clr-ivory` | `#faf8f3` | Page base background |
| `--clr-gold` | `#c9a84c` | Primary accent |
| `--clr-gold-light` | `#e0be78` | Hover accent |
| `--clr-gold-dim` | `#a8893e` | Subtle accent |
| `--clr-text` | `#2c2926` | Body copy |
| `--clr-text-muted` | `#6b635a` | Secondary copy |
| `--clr-error` | `#b84040` | Form validation errors |
| `--ff-serif` | Playfair Display | Headings, logo |
| `--ff-sans` | Montserrat | Body, UI |
| `--shadow-sm/md/lg/xl` | — | Elevation scale |
| `--max-width` | `1160px` | Content column cap |

---

## Tech Stack

- **HTML5** — semantic sectioning, ARIA, `<form>`, `<address>`, `<blockquote>`, `<cite>`
- **CSS3** — custom properties, `clamp()`, `IntersectionObserver`-driven animations, CSS Grid + Flexbox, `@media` at 768 px / 480 px
- **Vanilla JavaScript (ES5 IIFE)** — no transpiler, no bundler; works in any modern browser
- **GitHub Actions** — `.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `main`

---

## Images

All photos are served from the **Unsplash CDN** at runtime. An internet connection is required to display them. Hero background is set in `styles.css` under `#hero { background-image: … }`. Dish photos are `<img>` elements in `index.html` with `loading="lazy"`.

Format: `https://images.unsplash.com/photo-{id}?w={width}&q=80`

---

## Restaurant Info (fictional)

| | |
|---|---|
| Address | 12 Duxton Hill, Singapore 089597 |
| Phone | +65 6123 4567 |
| Email | reservations@maisonlumiere.sg |
| Lunch | Mon – Sun 12:00 – 14:30 |
| Dinner | Mon – Sun 18:00 – 22:30 |
| Established | 1987 |

---

## License

MIT — free to use, modify, and distribute.

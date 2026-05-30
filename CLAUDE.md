# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-page restaurant booking website for **Maison Lumière**, a fictional upscale French restaurant. Pure vanilla HTML/CSS/JS — no build tools, no frameworks, no dependencies. Open `index.html` directly in a browser.

## Running the site

No build step. Open the file directly:

```
# Windows
start index.html

# macOS
open index.html

# Or serve locally to avoid any CORS issues with background-attachment: fixed
npx serve .
python -m http.server 8080
```

## Architecture

Three files — everything is intentionally inline with no abstraction layers:

| File | Responsibility |
|------|---------------|
| `index.html` | Page structure and content. All sections in order: `#hero` → `#menu` → `#testimonials` → `#reservations` → `#footer` |
| `styles.css` | All visual styling. CSS custom properties at the top of `:root` define the entire design token set (colors, fonts, shadows, spacing). Media query breakpoints at 768 px and 480 px. |
| `script.js` | All interactivity wrapped in a single IIFE. Four discrete sub-systems: nav scroll effect, mobile nav toggle, `IntersectionObserver` fade-ins, testimonial carousel, and form validation. |

## Design tokens (`styles.css` `:root`)

Key variables to change when adjusting the look:

- `--clr-gold` / `--clr-gold-light` — primary accent colour
- `--clr-dark` / `--clr-charcoal` — nav and footer backgrounds
- `--clr-cream` / `--clr-ivory` — section backgrounds
- `--ff-serif` / `--ff-sans` — typeface stack (Google Fonts: Playfair Display + Montserrat)

## Images

All photos are fetched from Unsplash CDN at runtime — an internet connection is required. Hero background is set in `styles.css` under `#hero { background-image: ... }`. Dish photos are inline `<img>` `src` attributes in `index.html`. Format: `https://images.unsplash.com/photo-{id}?w={width}&q=80`.

## Form behaviour (`script.js`)

The reservation form is fully client-side. No data is sent anywhere. On valid submit it renders a confirmation message and calls `form.reset()`. Validation rules: all fields required except Special Requests; email checked via regex; guests must be 1–20; date must be today or later.

## Carousel (`script.js`)

The testimonial carousel uses pixel-based `translateX` (not `%`) because `flex: 0 0 100%` on each slide makes the track wider than the wrapper. The slide offset is `current * wrapper.offsetWidth`. A `resize` listener recalculates the offset with `transition: none` to avoid animating during reflow.

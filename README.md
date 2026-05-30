# Maison Lumière

A single-page restaurant booking website for **Maison Lumière**, a fictional upscale French restaurant. Built with pure vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## Live Demo

[https://mohanpothula.github.io/restaurant/](https://mohanpothula.github.io/restaurant/)

## Features

- Responsive design (mobile, tablet, desktop)
- Sticky navigation with scroll effect
- Animated section fade-ins using IntersectionObserver
- Testimonial carousel
- Reservation form with client-side validation
- Google Fonts (Playfair Display + Montserrat)
- Unsplash CDN images

## Project Structure

```
├── index.html      # Page structure and content
├── styles.css      # All styling and CSS custom properties
└── script.js       # Nav, carousel, fade-in, form validation
```

## Running Locally

No build step required — open directly in a browser:

```bash
# Option 1: open directly
start index.html          # Windows
open index.html           # macOS

# Option 2: local server (avoids CORS issues)
npx serve .
python -m http.server 8080
```

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- CSS custom properties for design tokens
- IntersectionObserver API for scroll animations
- GitHub Actions for CI/CD deployment to GitHub Pages

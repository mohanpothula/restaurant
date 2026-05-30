# GitHub — Pages, About, and 404 setup

End-to-end command for enabling GitHub Pages via GitHub Actions, updating repo About metadata, and verifying there are no broken links or 404 issues.

## Prerequisites

Ensure `gh` is authenticated:
```bash
gh auth status
# If not logged in:
gh auth login
```

---

## Step 1 — Enable GitHub Pages source = "GitHub Actions"

The GitHub Actions workflow (`deploy.yml`) requires Pages to be configured to use "GitHub Actions" as its source, NOT a branch. Set this once via the API:

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/mohanpothula/restaurant/pages \
  -f build_type=workflow \
  -f source='{"branch":"main","path":"/"}' 2>&1 || \
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/mohanpothula/restaurant/pages \
  -f build_type=workflow
```

If you get a 409 (already enabled), that is fine — just verify the source is set to workflow:
```bash
gh api /repos/mohanpothula/restaurant/pages --jq '.build_type + " | " + .url'
```

Expected output: `workflow | https://api.github.com/repos/mohanpothula/restaurant/pages`

---

## Step 2 — Verify `deploy.yml` is correct

Read `.github/workflows/deploy.yml` and confirm:
- Triggers on `push` to `main` and `workflow_dispatch`
- Permissions: `contents: read`, `pages: write`, `id-token: write`
- Steps in order: `checkout` → `configure-pages` (no `enablement: true`) → `upload-pages-artifact` (path `.`) → `deploy-pages`
- **No** `enablement: true` on `configure-pages` — that requires `administration: write` which is NOT granted

If anything is wrong, apply the correct workflow:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## Step 3 — Verify 404.html exists

Check that `404.html` exists at the repo root. GitHub Pages serves this file for any unmatched path, and it redirects the user back to `https://mohanpothula.github.io/restaurant/`.

```bash
ls -la 404.html
```

If missing, create it with a redirect script pointing to `/restaurant/`.

---

## Step 4 — Check for broken asset references

Scan `index.html` for any asset path starting with `/` (absolute), which breaks on project Pages because the base is `/restaurant/`, not `/`:

```bash
grep -n 'src="\/' index.html || echo "No absolute src paths"
grep -n 'href="\/' index.html | grep -v 'http' || echo "No absolute href paths"
grep -n "url('/" styles.css || echo "No absolute CSS url() paths"
```

All asset references must be **relative** (`styles.css`, `script.js`, `./img/foo.png`) or **fully qualified** (`https://...`). Fix any that start with `/` without a hostname.

---

## Step 5 — Trigger a fresh deployment

Push any change (or use `workflow_dispatch`) to kick off the Actions workflow:

```bash
# Option A — workflow_dispatch (no commit needed)
gh workflow run deploy.yml --repo mohanpothula/restaurant

# Option B — push a trivial change
git commit --allow-empty -m "chore: trigger GitHub Pages redeploy" && git push origin main
```

Watch the run:
```bash
gh run watch --repo mohanpothula/restaurant
```

---

## Step 6 — Update repo About (description, homepage, topics)

```bash
gh repo edit mohanpothula/restaurant \
  --description "Maison Lumière — upscale French restaurant single-page booking site. Pure HTML/CSS/JS, no dependencies." \
  --homepage "https://mohanpothula.github.io/restaurant/" \
  --add-topic html \
  --add-topic css \
  --add-topic javascript \
  --add-topic vanilla-js \
  --add-topic restaurant \
  --add-topic github-pages
```

---

## Step 7 — Smoke-test the live site

After the Actions run completes (usually 1–2 minutes):

```bash
# Check the root page returns 200
curl -o /dev/null -s -w "%{http_code}" https://mohanpothula.github.io/restaurant/

# Check a non-existent path returns our 404.html (not a raw GitHub 404)
curl -o /dev/null -s -w "%{http_code}" https://mohanpothula.github.io/restaurant/does-not-exist

# Check CSS loads correctly
curl -o /dev/null -s -w "%{http_code}" https://mohanpothula.github.io/restaurant/styles.css

# Check JS loads correctly
curl -o /dev/null -s -w "%{http_code}" https://mohanpothula.github.io/restaurant/script.js
```

All four should return `200` (the last two because GitHub Pages serves relative assets from the repo root).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Workflow fails with "Pages not enabled" | Pages source not set to Actions | Re-run Step 1 |
| Workflow fails with "Resource not accessible" | `pages: write` missing or token scope wrong | Check permissions block in `deploy.yml` |
| CSS/JS return 404 | Absolute `/` paths in HTML/CSS | Fix to relative paths (Step 4) |
| Whole site returns 404 | Pages not yet deployed or URL wrong | Wait for workflow, check `gh run list` |
| Redirect loop on 404.html | `404.html` script pointing to wrong repo path | Update `/restaurant/` to match your actual repo name |

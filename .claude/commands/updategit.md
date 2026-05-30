# Update Git — full publish workflow

Performs a safe, end-to-end push of this project to GitHub with README sync, repo-about update, and a secrets scan.

## Steps

### 1. Secrets scan (run FIRST — abort if anything is found)

Search the working tree for patterns that look like secrets or API keys before touching git:

```bash
# API keys, tokens, and generic secrets
grep -rn \
  -e "api[_-]?key\s*[=:]\s*['\"][^'\"]\{8,\}" \
  -e "apikey\s*[=:]\s*['\"][^'\"]\{8,\}" \
  -e "secret\s*[=:]\s*['\"][^'\"]\{8,\}" \
  -e "token\s*[=:]\s*['\"][^'\"]\{8,\}" \
  --include="*.js" --include="*.ts" --include="*.py" \
  --include="*.json" --include="*.env" --include="*.yml" \
  --include="*.yaml" --include="*.html" --include="*.css" \
  --include="*.sh" --include="*.md" \
  . 2>/dev/null | grep -v "node_modules" | grep -v ".git"

# Passwords — plaintext assignments in any common form
grep -rn \
  -e "password\s*[=:]\s*['\"][^'\"]\{1,\}" \
  -e "passwd\s*[=:]\s*['\"][^'\"]\{1,\}" \
  -e "pwd\s*[=:]\s*['\"][^'\"]\{6,\}" \
  -e "db_pass\s*[=:]\s*['\"][^'\"]\{1,\}" \
  -e "db_password\s*[=:]\s*['\"][^'\"]\{1,\}" \
  --include="*.js" --include="*.ts" --include="*.py" \
  --include="*.json" --include="*.env" --include="*.yml" \
  --include="*.yaml" --include="*.html" --include="*.sh" \
  . 2>/dev/null | grep -v "node_modules" | grep -v ".git" \
  | grep -iv "placeholder\|example\|your[_-]password\|changeme\|TODO\|FIXME"

# Well-known key formats (AWS, OpenAI, GitHub, Stripe, private keys)
grep -rn \
  -e "AKIA[0-9A-Z]\{16\}" \
  -e "sk-[a-zA-Z0-9]\{32,\}" \
  -e "ghp_[a-zA-Z0-9]\{36\}" \
  -e "ghs_[a-zA-Z0-9]\{36\}" \
  -e "sk_live_[a-zA-Z0-9]\{24,\}" \
  -e "pk_live_[a-zA-Z0-9]\{24,\}" \
  -e "-----BEGIN.*PRIVATE KEY-----" \
  -e "-----BEGIN RSA PRIVATE KEY-----" \
  --include="*.js" --include="*.ts" --include="*.py" \
  --include="*.json" --include="*.env" --include="*.yml" \
  --include="*.yaml" --include="*.html" --include="*.css" \
  --include="*.sh" --include="*.md" \
  . 2>/dev/null | grep -v "node_modules" | grep -v ".git"
```

Also check for `.env` files and certificate/key files that should not be committed:

```bash
git ls-files | grep -E "\.env$|\.env\.|\.pem$|\.key$|\.p12$|\.pfx$|credentials\.json"
```

**If any hits are found:** stop immediately, report the exact file path and line number to the user, and do NOT proceed to the next steps.

### 2. Ensure .gitignore covers sensitive files

Verify (or add) these entries to `.gitignore` if they are missing:

```
.env
.env.*
*.pem
*.key
*.p12
*.pfx
secrets.json
credentials.json
```

### 3. Generate / update README.md

Read `index.html`, `styles.css`, and `script.js` to understand the current state of the project, then write (or overwrite) `README.md` with:

- **Project name and one-line description** (Maison Lumière — upscale French restaurant booking page)
- **Live demo link** (if a GitHub Pages URL is detectable from the remote: `https://<owner>.github.io/<repo>/`)
- **Screenshot placeholder** line: `![screenshot](screenshot.png)` — note to user that a real screenshot must be added manually
- **Features** — bullet list derived from the actual code (nav scroll, mobile menu, fade-in animations, testimonial carousel, reservation form with validation)
- **Tech stack** — Pure HTML / CSS / JS, no dependencies, no build step
- **Getting started** section — how to open the file locally (from CLAUDE.md)
- **Design tokens** section — list the CSS variables from `:root` in `styles.css`
- **Images** — note about Unsplash CDN requirement
- **License** line (MIT unless a LICENSE file says otherwise)

### 4. Stage, commit, and push

```bash
git add -A
git status
```

Review what will be committed and confirm nothing unexpected is staged. Then:

```bash
git commit -m "chore: sync README and project files

Auto-generated via /updategit workflow.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin main
```

If the push is rejected (non-fast-forward), run `git pull --rebase origin main` first, resolve any conflicts, then push.

### 5. Update GitHub repo About (description + topics + website)

Use the GitHub CLI to patch the repository metadata:

```bash
# Set description
gh repo edit --description "Maison Lumière — upscale French restaurant single-page booking site. Pure HTML/CSS/JS, no dependencies."

# Set homepage to GitHub Pages URL
gh repo edit --homepage "https://mohanpothula.github.io/restaurant/"

# Add relevant topics
gh repo edit --add-topic "html" --add-topic "css" --add-topic "javascript" \
             --add-topic "restaurant" --add-topic "vanilla-js" --add-topic "frontend"
```

If `gh` is not authenticated, prompt the user to run `gh auth login` first.

### 6. Final report

Print a summary:
- Secrets scan: PASSED / FAILED
- Files pushed: list of changed files
- README: created / updated
- Repo About: updated (description, homepage, topics)
- GitHub Pages URL (if enabled)

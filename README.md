# donatmolnar.github.io

Personal CV / portfolio site. Static HTML, CSS and vanilla JavaScript — no build step,
no dependencies, no third-party requests at runtime.

**Live:** https://donatmolnar.github.io/

## Publishing it

The repository must be named **`donatmolnar.github.io`** and be **public** — that exact name
is what serves the site at the bare `https://donatmolnar.github.io/`, and GitHub Pages only
runs on public repositories under the Free plan.

1. Push this directory to the `main` branch.
2. **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. **Actions** tab → re-run *Deploy to GitHub Pages* (the first push ran before Pages existed).

The workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml) publishes the
repository root on every push to `main`.

> **Uploading through the web UI instead?** Set **Source** to *Deploy from a branch* →
> `main` / `/ (root)` and delete `.github/workflows/pages.yml` — with a branch source the
> workflow would run and fail on every push. Keep `.nojekyll`; the browser upload skips
> dotfiles, so create it with *Add file → Create new file*.

The absolute URLs in `<head>` (canonical, Open Graph), `sitemap.xml` and `robots.txt` all
point at the bare domain. Every asset path is relative, so only those would need changing if
the site ever moved to a sub-path.

## Local preview

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Layout

```
index.html                 all markup + the icon sprite + JSON-LD
assets/css/styles.css      design tokens, components, sections, responsive rules
assets/js/main.js          theme, scroll dots, back-to-top, cursor glow, reveals
assets/img/badges/*.png    Credly badge artwork, served locally
assets/img/og.png          1200×630 social preview
assets/img/favicon.svg
.github/workflows/pages.yml
```

## Editing

**Colours and spacing** — the `:root` block at the top of `styles.css`. `--accent`,
`--accent-strong` and `--accent-2` drive every highlight, glow and gradient;
`--accent-rgb` must be kept in sync with `--accent` (it is used for the alpha glows).
`:root[data-theme="light"]` holds the light-mode overrides.

**Sections** — each `<section class="section" id="…">` pairs with one `<a class="dot">` in
`.dotnav`. To add a section, copy both. The `data-reveal` attribute opts an element into the
fade-up on scroll; `style="--d:.08s"` staggers it. `data-glow` opts a card into the
cursor-tracking glow.

**Timeline** — the `<ol class="timeline">` entries in `#journey`. Year, tag, title, meta.

**Certifications** — hard-coded in `#certifications`, mirroring
[credly.com/users/donat-molnar](https://www.credly.com/users/donat-molnar/badges). When a new
badge is earned, save its image into `assets/img/badges/` and copy an existing card.

## Accessibility & behaviour notes

- Dark by default; the toggle persists to `localStorage` and otherwise follows the OS setting.
  An inline script in `<head>` applies the theme before first paint to avoid a flash.
- `prefers-reduced-motion` disables smooth scrolling, scroll snapping, reveals and the
  pulsing timeline node.
- Scroll snapping is `proximity` (not `mandatory`) so long sections never trap the scroll,
  and it is turned off entirely below 760px.
- Everything except the two outbound links (LinkedIn, Credly) is served from this repository.

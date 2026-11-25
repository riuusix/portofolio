---
name: frontend-engineering
description: Semantic HTML5, modular CSS/JS architecture, zero-build GitHub Pages compatibility, Git branch safety, and existing feature preservation for Budi Nara's portfolio.
---

# Frontend Engineering — Architecture, Maintainability & Preservation

Use this skill for all HTML, CSS, JavaScript, asset management, and Git workflow decisions.

## 1. Technology Stack & Constraints

- **Stack:** HTML5, Tailwind CSS (CDN), modular custom CSS (`styles/doodleverse.css`), Vanilla JavaScript ES6+ (`index.js`), Font Awesome (CDN), inline SVG.
- **No framework migration:** Do not introduce React, Vue, Next.js, Vite, or build pipelines.
- **GitHub Pages compatibility:** All asset, CSS, JS, and PDF references must be relative paths (`styles/doodleverse.css`, `index.js`, `img/...`, `pdf/...`) with no server-side dependencies.

## 2. Git Safety & Incremental Workflow

- Always work on branch `redesign/cartoon-monochrome`. Never commit to or modify `main`.
- Implement and verify section-by-section rather than rewriting blindly.
- Never delete existing assets in `img/` or `pdf/` without explicit verification that they are unused.

## 3. Existing Integrations & Features to Preserve

Every existing capability must continue working cleanly (and known bugs fixed rather than hidden):

1. **Theme Toggle (`#themeToggle`)** — Toggle `html.dark`, persist to `localStorage`, and **restore saved theme on initial load** (fixing the existing write-only bug).
2. **Language Toggle (`#langToggle`)** — Bilingual `ID` / `EN` switching via `[data-key]`, including fixing the commented-out `proj_subtitle` key, adding missing `data-key` attributes on all 8 project cards, and keeping dynamic UI strings aligned.
3. **Time-Based Greeting (`#greeting-badge`)** — Updates on load and on language toggle.
4. **Role Typing Effect (`#typing-text`)** — Preserves the 4 roles (`Fullstack Developer`, `UI/UX Enthusiast`, `Laravel Warrior`, `Problem Solver`), respecting `prefers-reduced-motion`.
5. **CV Download** — Keeps exact link to `pdf/CV_Budi Nur Rahman.pdf`.
6. **GitHub Stats API (`#github-stats`)** — Fetches `https://api.github.com/users/riuusix`, degrades gracefully on rate limit/offline.
7. **Projects & Detail Modal (`#project-modal`)** — Preserves all 8 projects (`iconplus` with its 4-card architecture schema, `tracker`, `kotakita`, `festivo`, `gudang`, `splitbuddy`, `todo`, `ianalytics`), all Figma/Vercel/building links, and all 7 `img/project-*.png` assets.
8. **Beyond Coding & Folder Drawer (`#ios-folder`)** — Preserves Gaming (`ml.png`, `hsr.png`, `genshin.png`, `Transport Fever 2` with fallback) and Music (Spotify & Apple Music profile links).
9. **Contact Form (`#contact-form`)** — Preserves Formspree endpoint `https://formspree.io/f/xeoylydd`, `FormData` POST, loading spinner, and success/error status feedback.
10. **Social Links, Now Playing & Back-to-Top** — Preserves Instagram (`@bieurs_`), GitHub (`riuusix`), LinkedIn (`budinurrahman`), Now Playing (`Silly Dance - NCT WISH`), and `#back-to-top`.

## 4. Code Quality & Semantic Standards

- **Semantic HTML:** Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<button type="button">` for interactive triggers, and `<label for="...">` for every form input.
- **Viewport accessibility:** Never use `maximum-scale=1.0, user-scalable=no`.
- **Clean JS scoping:** Encapsulate logic inside an IIFE or module-like namespace to avoid polluting `window`, while exposing only explicitly needed handlers or wiring event listeners via `data-*` attributes.
- **CSS separation:** Move custom design tokens, comic utilities, halftone patterns, and animations out of inline `<style>` into `styles/doodleverse.css`.

---
name: quality-assurance
description: Functional verification, responsive testing, accessibility auditing, performance inspection, and anti-slop visual review for DOODLEVERSE.
---

# Quality Assurance — Verification, Accessibility & Visual Audit

Use this skill after implementing sections and before final handoff to validate that DOODLEVERSE is bug-free, accessible, fast, and visually cohesive.

## 1. Functional Verification Matrix

Verify every interactive flow in a real browser (zero console errors):

- [ ] **Theme switching:** Light -> Dark -> Light updates all surfaces, borders, hard shadows, halftone patterns, SVGs, and persists across page reload.
- [ ] **Language switching:** ID -> EN -> ID translates navigation, hero, greeting badge, about, all 4 timeline items, `proj_subtitle`, all 8 project cards, Beyond Coding, and Contact copy.
- [ ] **Navigation:** Anchor links scroll smoothly, active section highlights accurately, mobile menu opens/closes smoothly and closes on link click or `Escape`.
- [ ] **Hero:** Greeting matches local time, typing cycles roles (or stays static under reduced motion), CV link opens `pdf/CV_Budi Nur Rahman.pdf`, mascot reacts on hover/click.
- [ ] **GitHub Stats:** Fetches `riuusix` repos/followers cleanly or stays hidden without throwing unhandled errors if rate-limited.
- [ ] **Project Cards & Modal:** All 8 projects open `#project-modal`; `iconplus` renders its 4-card monochrome schema; the other 7 load their `img/project-*.png`; live links open in new tab; `empty` links show disabled building state; modal closes via X button, backdrop click, and `Escape` key.
- [ ] **Beyond Coding & Folder Modal:** Gaming and Music cards open `#ios-folder` with all items; Spotify & Apple Music links work; closes via X, backdrop, and `Escape`.
- [ ] **Contact Form:** Required validation triggers properly; Formspree endpoint `https://formspree.io/f/xeoylydd` and loading/status states are intact.
- [ ] **Footer & Utilities:** Instagram, GitHub, LinkedIn links work; `#back-to-top` appears after scrolling and returns to top smoothly.

## 2. Responsive & Layout Audit

Test at **Desktop (1440px)**, **Laptop (1024px)**, **Tablet (768px)**, and **Mobile (375px)**:
- Zero horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`).
- Touch targets at least `44×44px` on mobile.
- No overlapping fixed elements (Now Playing pill, Back-to-Top button, floating nav).
- No essential interaction gated behind hover-only states.

## 3. Accessibility Audit

- Viewport meta allows user zoom (`width=device-width, initial-scale=1.0`).
- Every interactive control is reachable via `Tab` and operable via `Enter` / `Space`, with a high-contrast `:focus-visible` ink ring.
- Modals use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` dismissal.
- All form inputs have associated `<label>` elements.
- All meaningful images have descriptive `alt` text; decorative SVGs have `aria-hidden="true"`.
- Contrast ratios meet WCAG AA (`>= 4.5:1` for body text) in both Light and Dark modes.
- Emulating `prefers-reduced-motion: reduce` disables continuous floats/marquees and removes jarring transitions while keeping all content visible.

## 4. Performance & Anti-Slop Visual Review

- Check DevTools Console and Network tab: zero JS exceptions, zero broken local assets (404s).
- Verify lazy loading on below-the-fold images and no heavy layout shifts (CLS).
- Run the **10-question Anti-Slop Self-Review**:
  1. Does it look genuinely art-directed rather than like a generic AI template?
  2. Does each section have distinct layout rhythm and whitespace?
  3. Is the monochrome Comic Book × Sketchbook × Cartoon Studio world cohesive in both Light and Dark modes?
  4. Are decorative doodles supporting readability rather than competing with it?
  5. Is `main` completely untouched and all work isolated on `redesign/cartoon-monochrome`?

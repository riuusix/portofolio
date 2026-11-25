---
name: cartoon-illustration
description: Custom monochrome SVG illustrations, DOODLEVERSE cartoon mascot design, speech bubbles, halftone patterns, hand-drawn lines, and light/dark-compatible stickers.
---

# Cartoon Illustration — Monochrome SVG & Sketchbook Craft

Use this skill whenever creating or integrating illustrations, character art, speech bubbles, decorative doodles, stickers, or comic patterns.

## 1. Monochrome Ink Discipline

- Every custom SVG illustration must use CSS variables (`currentColor`, `var(--ink)`, `var(--paper)`, `var(--warm-paper)`) rather than hardcoded black/white fills so it adapts seamlessly between Light Mode and Dark Mode.
- Maintain consistent stroke language:
  - Primary character/panel outlines: `stroke-width="2.5"` to `"3"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
  - Sketch/detail lines and crosshatching: `stroke-width="1.5"` to `"2"`.
- Avoid generic clipart or multi-color stock SVGs.

## 2. The DOODLEVERSE Mascot (Developer Character)

- **Role:** A charming, clean monochrome line-art cartoon developer character representing Budi Nara (head/shoulders or compact studio character with glasses/headphones or laptop/pen motif).
- **Anatomy for Animation:** Group SVG parts semantically (`#mascot-head`, `#mascot-eyes`, `#mascot-pupils`, `#mascot-mouth`, `#mascot-hand`, `#mascot-sparkle`) so JS/CSS can cleanly animate:
  - Waving hand (`transform-origin` at wrist/elbow).
  - Subtle pupil tracking (`±3px` within eye bounds).
  - Swappable facial expressions on click (smile, focused/coding, amazed, wink).
- **Proportions & Restraint:** Keep geometry simple, bold, and readable at both desktop (`140px–200px`) and mobile (`96px–120px`).

## 3. Contextual Storytelling Elements

Every illustration must have a clear narrative job:

- **Hero:** Speech bubble for the live time-based greeting (`#greeting-badge`), hand-drawn arrow pointing to the CTA or portrait, and subtle halftone dot corner backdrop.
- **Profile Portrait (`img/aku.jpeg`):** Preserve the real photo in an illustrated monochrome comic frame (ink border, subtle halftone mat, corner tape/sticker marks) with crisp monochrome-to-natural hover clarity so Budi remains immediately recognizable.
- **About / Sketchbook:** Hand-drawn underline under section title, tape strips on sticky-note cards, small margin doodle (coffee cup / code brackets).
- **Experience Timeline:** Numbered comic issue badges (`#01`–`#04`) and a slightly organic SVG ink spine.
- **Projects:** Monochrome-framed thumbnails (`img/project-*.png`) with comic corner tags; custom monochrome schematic diagram inside the `iconplus` project modal.
- **Beyond Coding:** Expressive monochrome line-art badges for Observer/Brain, Controller, Headphones/Cassette, and Fantasy Book/Sparkle; monochrome cassette motif for the floating "Now Playing" pill.
- **Contact:** Cartoon ink envelope illustration that visually seals/flies on form submission.
- **Footer:** Hand-drawn signature squiggle / tiny waving doodle.

## 4. SVG Optimization & Accessibility

- Use clean, minimal `viewBox` coordinates with rounded integers (no bloated editor exports).
- Mark purely decorative SVGs with `aria-hidden="true"` and `focusable="false"`.
- Give interactive or informative SVGs (such as the clickable mascot) proper button wrappers, `aria-label`, and visible `:focus-visible` outlines.

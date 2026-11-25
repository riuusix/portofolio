---
name: frontend-design
description: Anti-slop frontend art direction, DOODLEVERSE design system tokens, monochrome typography, spatial composition, and responsive UI standards for Budi Nara's portfolio.
---

# Frontend Design — DOODLEVERSE Art Direction & Anti-Slop System

Use this skill whenever designing, structuring, styling, or reviewing any section or component of the DOODLEVERSE portfolio.

## 1. Visual Identity & Balance

- **Core concept:** *A developer's world, illustrated one line of ink at a time.*
- **Style ratio:** 60% Comic Book (bold ink outlines, panels, speech bubbles, halftone accents, hard offset shadows) · 25% Sketchbook (paper warmth, hand-drawn underlines, margin annotations, sticky notes, arrows) · 15% Cartoon Studio (monochrome character mascot, expressive stickers, playful micro-objects).
- **Principle:** *Professional content, playful presentation.* Recruiters, collaborators, and engineers must scan information effortlessly.

## 2. Anti-Slop Enforcement Checklist

Before finalizing any section, reject and refactor these generic AI-template anti-patterns:

- **No generic SaaS card grids:** Never make every section a uniform 3-column rounded card grid. Vary rhythm, asymmetry, and panel geometry across sections.
- **No purple/blue/pink gradients or glassmorphism:** Remove frosted glass blur (`backdrop-filter`), neon glows, and colorful background blobs.
- **No random emojis as illustration substitutes:** Replace decorative emojis with purpose-built monochrome SVG ink marks, stamps, or stickers.
- **No uniform boxification:** Not every element should be a thick-bordered comic panel. Mix open sketchbook whitespace, ruled-paper notes, and crisp ink borders.
- **No decorative clutter competing with copy:** Every doodle, arrow, or halftone accent must guide the eye or frame a hierarchy—never sit behind body text at distracting contrast.

## 3. Color System (Strict Monochrome + Coherent Dark Inversion)

Define and consume tokens via CSS custom properties (never hardcode arbitrary slate/pink hexes):

| Role | Light Mode (`:root`) | Dark Mode (`html.dark`) |
|---|---|---|
| Primary Paper / Canvas | `#FFFFFF` | `#171717` |
| Warm Paper / Secondary Surface | `#F2F0EA` | `#242424` |
| Primary Ink / Text | `#171717` | `#FFFFFF` |
| Soft Ink / Subheadings | `#333333` | `#E5E5E5` |
| Muted Ink / Secondary Copy | `#777777` | `#B5B5B5` |
| Primary Border | `#171717` (`2px solid`) | `#F2F0EA` (`2px solid`) |
| Secondary / Sketch Border | `#D9D9D9` (`1px solid`) | `#333333` (`1px solid`) |
| Accent Surface / Halftone Fill | `#F2F0EA` | `#333333` |

## 4. Typography Hierarchy

Load and pair three intentional font roles:

1. **Display (`--font-display`):** `'Bricolage Grotesque', 'Space Grotesk', sans-serif` — bold/extrabold (`700–800`), tight tracking (`-0.02em` to `-0.03em`) for hero headlines, section titles, and panel numbers.
2. **Body (`--font-body`):** `'DM Sans', sans-serif` — clean, high legibility (`400–600`), comfortable line height (`1.6–1.75`) for bios, project descriptions, and forms.
3. **Accent (`--font-accent`):** `'Caveat', cursive` — handwritten margin notes, arrow captions, issue numbers, and playful stamps. **Never** use for long paragraphs, navigation links, or critical form instructions.

## 5. Borders, Shadows & Surface Craft

- **Primary container border:** `2px solid var(--ink-border)` with moderate corner radii (`10px–16px`), plus occasional organic/sketch border-radius or SVG hand-drawn frames.
- **Hard offset shadows:**
  - Rest: `box-shadow: 5px 5px 0 var(--shadow-ink);`
  - Hover: `transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--shadow-ink);`
  - Active/Pressed: `transform: translate(3px, 3px); box-shadow: 2px 2px 0 var(--shadow-ink);`
- **Halftone & Paper Textures:** Subtle `radial-gradient` dot matrices at low opacity (`0.06–0.12`) reserved for panel corners, hero backdrops, and section dividers—never obscuring text contrast.

## 6. Section Variation Rule

Each major section must have a distinct spatial personality:
- **Hero:** Asymmetric editorial spread (display type + speech bubble left, framed portrait + interactive SVG mascot right).
- **About:** Open sketchbook spread (ruled/sticky-note bio + margin annotations + inked GitHub stamp).
- **Experience:** Numbered comic-strip timeline (`#01`–`#04`) with hand-drawn ink spine.
- **Projects:** Varied comic-panel layout (featured lead panel + staggered grid/carousel with subtle tilt variations and monochrome-to-color thumbnail reveal).
- **Beyond Coding:** Tactile scrapbook / sticker board with interactive folder drawer.
- **Contact:** Conversational comic letter/envelope composition.
- **Footer:** Clean ink-stamp sign-off with signature doodle.

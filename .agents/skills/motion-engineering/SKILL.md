---
name: motion-engineering
description: Motion design, CSS/JS animation choreography, SVG stroke drawing, character state transitions, scroll reveals, and reduced-motion performance standards for DOODLEVERSE.
---

# Motion Engineering — DOODLEVERSE Interaction & Choreography

Use this skill when implementing animations, transitions, scroll choreography, pointer reactions, or interactive character states.

## 1. Motion Philosophy

- **Intentional, tactile, and comic-snappy:** Motion should feel like ink hitting paper, comic panels popping into view, and physical press-and-release buttons—never floaty generic fades.
- **Compositor-first:** Animate `transform` and `opacity` (and SVG `stroke-dashoffset`) wherever possible. Avoid animating `width`, `height`, `top`, `left`, or large blur filters.

## 2. Standard Timing & Easing Tokens

Define reusable CSS custom properties:

```css
:root {
  --ease-comic: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 140ms;
  --dur-base: 260ms;
  --dur-slow: 520ms;
}
```

- **Button press / release:** `120ms–160ms` with tactile shadow compression.
- **Card hover / tilt:** `220ms–280ms` (`--ease-comic`).
- **Scroll reveal / panel pop:** `450ms–600ms` (`--ease-comic`), staggered by `60ms–90ms` per sibling.
- **Modal / drawer entrance:** `280ms–380ms` scale (`0.94 -> 1`) + slight vertical shift (`12px -> 0`) + opacity.

## 3. Technology Choice

- Default to **CSS keyframes/transitions + IntersectionObserver + lightweight Vanilla JS** for zero extra bundle weight and guaranteed 60fps on mobile.
- Only load **GSAP / ScrollTrigger** if a specific sequence (e.g., pinned timeline scrubbing) cannot be achieved cleanly with CSS + IntersectionObserver. Never add unused animation libraries.

## 4. Core Motion Patterns

1. **Character State Machine:**
   - `idle`: Gentle low-amplitude float (`translateY(0 -> -5px)` at `3.6s`), paused when off-screen.
   - `greeting`: Waving hand rotation on initial load and hover.
   - `pointer`: Subtle eye-pupil / head tracking (`max ±4px`) throttled via `requestAnimationFrame` on desktop pointer devices only.
   - `click`: Cycles expressive face states (happy, surprised, focused, wink) with a short speech-bubble pop.
   - `contact-success`: Celebratory jump / envelope-send animation triggered by successful Formspree submission.
2. **SVG Stroke Drawing:**
   - Hand-drawn underlines, arrows, and timeline connectors animate `stroke-dashoffset` when revealed via `IntersectionObserver` (fire once, then unobserve).
3. **Scroll Choreography:**
   - Single shared `IntersectionObserver` (`threshold: 0.12`, `rootMargin: '0px 0px -40px 0px'`) that applies `.is-visible` and unobserves completed elements to free resources.
   - Optional lightweight scroll-progress ink bar along the top viewport edge using `transform: scaleX(...)`.
4. **Desktop-Only Cursor Accent (Optional / Priority 3):**
   - Strictly gated behind `window.matchMedia('(hover: hover) and (pointer: fine)')` and `prefers-reduced-motion: no-preference`.
   - Must use `pointer-events: none` and never block clicks, links, or text selection.

## 5. Lifecycle, Cleanup & Accessibility

- **Reduced motion (`@media (prefers-reduced-motion: reduce)`):**
  - Disable continuous idle floats, marquee loops, and parallax.
  - Replace slide/scale/bounce reveals with immediate visibility or minimal `opacity` transitions.
  - Keep typing animation static (show first role or clean static list) when reduced motion is preferred.
- **Off-screen pausing:** Pause continuous decorative animations (e.g., hero mascot idle or music equalizer) when their container leaves the viewport via `IntersectionObserver`.
- **No memory leaks:** Store observer and `requestAnimationFrame` IDs cleanly; never attach unthrottled `mousemove` DOM layout reads.

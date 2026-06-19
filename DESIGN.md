# FishingF'reel — Design Doc

> A genuinely beautiful, browser-based 3D fishing game. Fishing Planet–style realism.
> **Graphics first.** If the lake doesn't take your breath away on load, nothing else matters yet.

---

## 1. The one principle

The water and the light ARE the game. A fishing game lives or dies on whether the lake
feels real — the glassy calm, the sun glitter, the way the surface refracts the bottom,
the foam licking the shoreline. We build that hero shot first and hang every mechanic off it.

## 2. Tech decision (locked, pending research confirm on versions)

| Choice | What | Why |
|---|---|---|
| **Platform** | Browser (WebGPU + WebGL2 fallback) | No installer, free hosting, instant shareable link, runs anywhere. Modern WebGPU does photoreal water/light in 2026. |
| **Engine** | React Three Fiber + Three.js | Declarative scene graph, huge ecosystem (drei, postprocessing, rapier), Anthony's stack. |
| **Physics** | @react-three/rapier | Line/bobber/cast trajectory, light + fast WASM physics. |
| **State** | zustand (+ persist) | Simple stores, localStorage saves, no boilerplate. |
| **Build** | Vite | Fast HMR, trivial static deploy. |
| **Hosting** | GitHub Pages / Cloudflare Pages | Free, static, shareable. |
| **Assets** | CC0 only (Poly Haven, ambientCG, Quaternius, Kenney) | Zero cost, zero license risk. |

## 3. Graphics pillars (the "epic" checklist)

- **Water:** depth-graded color (shallow→deep), Fresnel reflections, refraction (see the bottom),
  Gerstner/normal-map ripples, shoreline foam, caustics, sun specular glitter. *Hero feature.*
- **Sky + Sun:** physical sky shader, sun position drives the directional light, golden-hour presets.
- **Lighting:** HDRI environment for grounded PBR, soft/contact shadows, ACES/AgX tone mapping, exposure.
- **Post:** bloom, depth of field, ambient occlusion (N8AO), subtle vignette + chromatic aberration, SMAA.
- **Materials:** real PBR on rod (carbon/cork/metal), wet rocks, sand, foliage with wind.

## 4. MVP scope — "the basics + a tutorial"

A new player loads in at a dock on a calm lake at golden hour and is walked through one catch:

1. **Look around** — first-person camera, drink in the water.
2. **Cast** — aim + power meter, line arcs out, bobber plops and ripples.
3. **Wait** — subtle ambient, line drifts.
4. **Bite** — bobber dips, audio cue, "Set the hook!".
5. **Reel** — tension minigame: reel without snapping the line while the fish tires.
6. **Land it** — catch card: species, weight, length, +XP.

That full loop, beautiful, is the milestone. Everything below is scaffolded but comes after.

## 5. Progression systems (post-MVP roadmap)

- **XP & Levels** — each catch grants XP; levels gate tackle tiers.
- **Tackle** — rods (power/action), reels (drag), lines (lb-test), lures/bait. Stats gate which fish you can *land*, not just hook. Customizable loadout.
- **Fish** — species with size/strength/preferred lure/depth/time-of-day.
- **Spots / Hotspots** — areas within a lake where fish concentrate; finding them is skill.
- **Outfits & cosmetics** — customization.
- **Watercraft** — kayaks → boats; reach offshore spots, new vantage.
- **Multiple venues** — more lakes/biomes unlock with level.

## 6. Build order (graphics-first)

1. Scaffold Vite + R3F project, WebGPU/WebGL2 canvas, tone mapping + post stack.
2. **Hero water + sky + sun + HDRI** — the breathtaking still frame. (No gameplay yet.)
3. Shoreline terrain, dock, foam, foliage — a believable place to stand.
4. First-person camera + a detailed PBR fishing rod in hand.
5. Casting: aim, power meter, line physics, bobber + ripples.
6. Fish spawn + bite logic + the reel-in tension minigame + catch card.
7. Tutorial overlay that scripts steps 4–6.
8. XP/level + tackle inventory (basic), persisted to localStorage.
9. Spots, more fish, cosmetics, watercraft, more lakes.

## 7. Status

- [x] Decisions locked
- [ ] Research sweep (stack versions, water/lighting techniques, mechanics, assets) — *in progress*
- [ ] Project scaffold
- [ ] Hero water shot

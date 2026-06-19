# Contributing to FishingF'reel

Thanks for your interest! This is a graphics-first browser fishing game built on React Three Fiber.

## Getting set up

```bash
npm install
npm run dev
```

## Guidelines

- **Read [`DESIGN.md`](DESIGN.md) first** — it captures the one principle (the water and light *are* the game), the build order, and the roadmap. PRs that fit the roadmap merge fastest.
- **Graphics quality is the bar.** Never degrade the look to add a mechanic. If a feature hurts the hero shot, find another way.
- **Keep it lean.** No unnecessary abstractions or heavy dependencies. CC0-only assets (Poly Haven, ambientCG, Quaternius, Kenney) — zero license risk.
- **Test your change** by running `npm run dev` and confirming the full loop still works (look → cast → bite → reel → land).
- **Performance matters** — the game must stay playable on integrated GPUs. Watch the FPS via the on-screen stats.

## Submitting

1. Fork and branch (`git checkout -b feature/my-thing`).
2. Make your change; verify it builds (`npm run build`).
3. Open a PR describing what changed and why, with a screenshot/GIF for any visual change.

Issues and discussion welcome on the [issue tracker](https://github.com/lordbasilaiassistant-sudo/fishing-freel/issues).

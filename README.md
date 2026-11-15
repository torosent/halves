# Halves

A daily domino logic puzzle. Place every domino on the board so each colored region matches its rule: a sum, a sum under or over a number, all equal, or all different.

**Play:** https://halves.tomer.dev

- Easy, Medium and Hard daily puzzles, the same for everyone on a given date, plus random practice puzzles
- Every puzzle is generated in the browser and checked to have exactly one solution
- Drag or tap to place, undo, hints, saved progress, and a shareable result

## Run locally

It's a single HTML file with no build step:

```bash
python3 -m http.server --directory public
```

## Test

The self-test generates puzzles at every level and checks they are valid and have exactly one solution:

```bash
node test.js
```

## Deploy

Hosted on Cloudflare (Workers static assets) at `halves.tomer.dev`:

```bash
npx wrangler deploy
```

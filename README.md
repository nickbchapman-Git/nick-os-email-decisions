# Nick OS — Email decisions

Clickable Night Forge prototype. Mock data only — **Send never sends mail.** Gate copy: `Send blocked — needs Approve-before-act`.

## Run locally

```bash
npm i && npm run dev
```

Dev server: **http://127.0.0.1:43147** (`0.0.0.0:43147`).

**Download (no Origin git auth):** https://litter.catbox.moe/ihbdia.zip  
Unzip, then `npm i && npm run dev`. Public tree: https://github.com/nickbchapman-Git/nick-os-email-decisions

Optional: `npm run build` then `npm run preview` (same port).

## What to click

Sit-rep canvas → FIFO email list → row opens DETAIL. Right pane: Follow · Create todo · Reply draft · Defer · Clear. Draft: edit · Rewrite · gated Send. ← back to list.

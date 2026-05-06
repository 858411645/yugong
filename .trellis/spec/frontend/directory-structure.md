# Directory Structure

## Overview

This is a pure vanilla web game project with no framework or build system. Code is loaded directly via `<script>` and `<link>` tags in `index.html`.

## Directory Layout

```
愚公移山/
├── index.html              — Main entry point, contains full UI structure
├── src/
│   └── game/
│       ├── style.css       — All styles (global reset, layout, components, animations)
│       ├── main.js         — Game engine (state, loop, rendering, events, save/load)
│       └── data.js         — Game constants, upgrade tables, pricing curves, formatter
└── .trellis/               — Trellis project management (not shipped)
```

## Module Organization

- **`index.html`**: Static HTML layout — top bar, mountain area, upgrade/descendant panels, modals. No inline JS/CSS.
- **`src/game/data.js`**: Pure data definitions — loaded first, no DOM dependency. Contains `GAME` config object and utility functions like `fmt()`.
- **`src/game/main.js`**: All game logic in an IIFE — loads after `data.js`, references `GAME` global.
- **`src/game/style.css`**: Compact single-file CSS — no preprocessor, no CSS modules.

## File Loading Order

`index.html` loads in this order:
1. `src/game/style.css`
2. `src/game/data.js`
3. `src/game/main.js`

## Naming Conventions

- Files: lowercase with hyphens or single words (`main.js`, `style.css`, `data.js`)
- JS globals: UPPER_SNAKE_CASE for constants (`GAME`), camelCase for functions (`fmt`, `clickMountain`)
- CSS classes: kebab-case (`.top-bar`, `.click-value`)
- HTML IDs: camelCase (`dirt`, `stone`, `saveBtn`, `progressBar`)

# State Management

## Overview

This project uses a single in-memory state object with localStorage persistence. No state management library is used.

## State Structure

```js
let state = {
    dirt: 0,              // Current dirt resource
    stone: 0,             // Current stone resource
    mountainLeft: 1e6,    // Remaining mountain HP
    descendants: {},      // { id: count } — owned descendants
    upgrades: {},         // { id: level } — purchased upgrades
    lastTime: Date.now(), // Timestamp for offline earnings calc
};
```

## State Categories

| Category | Location | Persistence |
|----------|----------|-------------|
| **Game state** | `state` object in main.js IIFE | localStorage (`yugong_save` key) |
| **Config/constants** | `GAME` object in data.js | None (hardcoded) |
| **UI state** | DOM elements directly | None (rebuilt on render) |

## State Mutation Rules

1. State is only mutated by functions inside the main.js IIFE
2. Every mutation calls `render()` to sync UI with state
3. `render()` calls `save()` to persist state to localStorage
4. No external code can access `state` — it's closure-private

## Save/Load Pattern

```js
function save() {
    const copy = { ...state };
    copy.lastTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
}

function load() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return def();
        const s = JSON.parse(raw);
        s.lastTime = Date.now();
        return s;
    } catch { return def(); }
}
```

## Offline Earnings

On load, `applyOffline()` calculates earnings since `lastTime`:
- Capped at 1 hour to prevent absurd gains
- Based on DPS (descendants per second) at save time
- Simple linear extrapolation (no complex simulation)

## When to Add Global State

Since this is a single-file game, all state is already "global" within the IIFE. If modules are extracted:
- Config/constants stay in `data.js`
- State + mutations stay together in one module
- UI rendering can be separated but must receive state as parameter

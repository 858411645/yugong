# Type Safety

## Overview

This project uses **plain JavaScript** with no TypeScript or type checking system. Runtime type safety is minimal and relies on defensive coding.

## Current Practices

- No static type checking
- No JSDoc type annotations
- Objects have consistent shapes by convention (not enforced)
- `localStorage` data is wrapped in try/catch for JSON parse errors

## Defensive Patterns

```js
// Safe JSON parsing with fallback
function load() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return def();
        return JSON.parse(raw);
    } catch { return def(); }
}

// Safe property access with defaults
const owned = state.upgrades[u.id] || 0;
```

## Common Mistakes to Avoid

- Assuming localStorage data is valid — always validate/fallback
- Using `==` instead of `===`
- Implicit type coercion in comparisons
- Not handling missing object keys

## If TypeScript Is Adopted

Should the project add TypeScript:
- Define interfaces for `GameState`, `Upgrade`, `Descendant`
- Use `strict: true` in tsconfig
- Type the `GAME` config object with `as const` for literal types
- Use discriminated unions for event types

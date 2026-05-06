# Error Handling

## Overview

This project has **no backend** and no server-side error handling. Errors are handled entirely on the client side.

## Client-Side Error Patterns

```js
// localStorage fallback on parse failure
function load() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return def();
        return JSON.parse(raw);
    } catch { return def(); }
}

// Defensive property access with defaults
const owned = state.upgrades[u.id] || 0;
```

## Current Practices

- JSON parse errors in localStorage → fallback to default state
- Missing object keys → use `|| defaultValue` pattern
- No error logging (browser console only during development)
- User-facing errors shown as inline UI feedback (not toast/alert)

## If a Backend Is Added

Should server-side code be introduced:
- Use structured error responses: `{ error: { code: string, message: string } }`
- Never leak stack traces to clients in production
- Log errors server-side with request context
- Handle network failures gracefully on the client (retry, offline queue)

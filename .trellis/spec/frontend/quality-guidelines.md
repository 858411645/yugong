# Quality Guidelines

## Overview

Quality standards for this vanilla JS/CSS/HTML game project.

## Required Patterns

- **IIFE for encapsulation**: All game logic wraps in `(function() { ... })()` to avoid global scope pollution
- **Separation of concerns**: HTML (structure), CSS (style), JS (logic) in separate files
- **Event delegation**: Use `data-action` attributes + delegated listeners instead of per-element handlers
- **Single render function**: One `render()` that rebuilds all dynamic UI from state
- **Save on every change**: State persisted to localStorage after every mutation
- **Defensive JSON parsing**: Always try/catch localStorage reads with fallback to defaults

## Forbidden Patterns

- No `eval()` or `new Function()`
- No inline JavaScript in HTML (`onclick`, `onload`, etc.)
- No inline CSS (`style="..."` attribute)
- No global variables outside the IIFE (except `GAME` config object and `fmt` utility)
- No `var` — use `const` (preferred) or `let`
- No synchronous localStorage writes in tight loops

## Code Organization

- **data.js**: Constants only, no DOM access, no side effects
- **main.js**: State, rendering, events, game loop — all in one IIFE
- **style.css**: Single file, class-based, no ID selectors

## Testing

- Manual testing in browser is the current standard
- Test both desktop (click) and mobile (touch) interactions
- Verify localStorage save/load cycle works correctly
- Verify offline earnings calculation on page reload
- Check that reset clears all state and re-renders

## Code Review Checklist

- [ ] No new global variables
- [ ] All DOM access uses `document.getElementById` or event delegation
- [ ] State mutations always followed by `render()` + `save()`
- [ ] localStorage access is try/catch wrapped
- [ ] New features work on mobile viewport (480px width)
- [ ] No console.log left in production code
- [ ] Game loop (`setInterval`) runs at reasonable rate (100ms)

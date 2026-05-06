# Hook Guidelines

## Overview

This project does **not** use React or any hook-based framework. The section is kept as a placeholder for potential future migration.

## Current State

- Pure vanilla JavaScript (no framework)
- No custom hooks or hook-like patterns
- Logic is organized as plain functions within an IIFE

## If React Is Adopted

Should the project migrate to React in the future:
- Custom hooks should follow the `use*` naming convention
- Game state would use `useReducer` or `useState`
- Persistence would use a `useLocalStorage` custom hook
- The game loop (`setInterval`) would use `useEffect` with cleanup

## Equivalent Patterns (Vanilla JS)

| React Hook | Vanilla JS Equivalent |
|------------|----------------------|
| `useState` | Closure variable + `render()` |
| `useEffect` | `setInterval` / `addEventListener` |
| `useMemo` | Compute on render |
| `useCallback` | Direct function reference |

# Directory Structure

## Overview

This project has **no backend**. It is a pure client-side web game (HTML + CSS + Vanilla JS), served as static files.

## Current State

- No server-side code exists
- No API endpoints
- Data persistence uses browser `localStorage` exclusively
- Static file hosting is sufficient (any HTTP server, GitHub Pages, Netlify, etc.)

## If a Backend Is Added

Should the project add a backend in the future:
- Use `src/server/` for backend source code
- Follow the same naming conventions as frontend (lowercase, hyphens)
- Keep API routes separate from business logic
- Document the new structure here

# Database Guidelines

## Overview

This project has **no database**. It is a pure client-side browser game with all data stored in `localStorage`.

## Current State

- Browser `localStorage` is the only persistence layer
- Single JSON-serialized state object under key `yugong_save`
- No server-side database, no queries, no migrations
- No ORM, no connection pooling

## If a Database Is Added

Should a backend with database be added in the future:
- Use SQLite for single-server deployments (simplicity)
- Use PostgreSQL if multi-user features are added
- Never store game state both client-side and server-side without conflict resolution
- Document schema changes as migration files

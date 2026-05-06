# Quality Guidelines

## Overview

This project has **no backend**. Quality standards apply to the frontend code only. See [frontend/quality-guidelines.md](../frontend/quality-guidelines.md) for current standards.

## Current State

- No server-side code exists
- No backend quality gates apply
- All quality enforcement is on the client-side code

## If a Backend Is Added

Should server-side code be introduced:
- Enforce linting (ESLint for Node.js)
- Require tests for API endpoints
- Use TypeScript for type safety
- Review for: input validation, rate limiting, error handling, SQL injection (if database added)

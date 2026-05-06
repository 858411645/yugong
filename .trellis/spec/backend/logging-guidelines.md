# Logging Guidelines

## Overview

This project has **no backend** and no structured logging. Debugging is done via browser DevTools.

## Current Practices

- No server-side logging exists
- Client-side debugging uses `console.log` during development (must be removed before production)
- Game state can be inspected via browser DevTools (state closure, localStorage)
- No analytics or telemetry

## Logging Rules (Development)

- Remove all `console.log` calls before considering code complete
- Use `console.error` for unexpected conditions during development
- No PII or sensitive data in any client-side log

## If a Backend Is Added

Should server-side logging be introduced:
- Use structured JSON logging (e.g., pino, winston)
- Log levels: `debug` (dev), `info` (key events), `warn` (recoverable), `error` (needs attention)
- Always include: timestamp, request ID, user context (if any)
- Never log: passwords, tokens, PII

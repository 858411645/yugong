# Component Guidelines

## Overview

This is a pure vanilla JS project with no component framework (no React, Vue, or Web Components). UI rendering is done via direct DOM manipulation using `innerHTML` and `textContent`.

## Component Structure

Since there are no framework components, the UI is organized as:

- **`index.html`**: Static HTML template with semantic IDs for all interactive elements
- **`main.js`**: Renders dynamic content into container elements via `innerHTML` with template literals
- **`style.css`**: All visual styling in a single file

## Re-render Pattern

The game uses a full re-render pattern:
- `render()` regenerates all dynamic HTML from game state
- Called after every state mutation (click, buy, reset)
- Cards are generated as HTML strings and set via `innerHTML`
- Event handling uses event delegation on parent containers

```js
// Example: card rendering pattern in main.js
upEl.innerHTML = S.UPGRADES.map(u => {
    const owned = state.upgrades[u.id] || 0;
    const cost = upgradeCost(u);
    const canBuy = state.dirt >= cost;
    return '<div class="card' + (canBuy ? '' : ' locked') + '" data-action="upgrade" data-id="' + u.id + '">'
        + '<div class="card-name">' + u.name + ' <span class="lvl">Lv' + owned + '</span></div>'
        + '<div class="card-desc">' + u.desc + '</div>'
        + '<div class="card-cost">🪙 ' + fmt(cost) + '</div>'
        + '</div>';
}).join('');
```

## Forbidden Patterns

- No inline event handlers (`onclick="..."` in HTML) — use `addEventListener` or event delegation
- No inline styles in HTML — all styling goes in `style.css`
- No framework libraries unless explicitly added to the project
- No `<script>` tags in the middle of HTML body — scripts go at end of `<body>`

## Styling Patterns

- Single `style.css` file, no preprocessor
- CSS class-based styling only (no ID selectors in CSS)
- BEM-like naming: `.top-bar`, `.click-value`, `.mountain-area`
- Responsive via `max-width` + `flexbox`, no media queries needed for this game
- Active states use `.active` class, disabled/locked states use `.locked` class
- Animations use CSS transitions (e.g., `.click-value.show` for float effect)

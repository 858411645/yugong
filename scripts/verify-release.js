const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest has icons');
assert.ok(fs.existsSync(path.join(root, manifest.icons[0].src)), 'manifest icon exists');
assert.match(sw, /assets\/icon\.svg/, 'service worker caches icon');
assert.match(sw, /index\.html/, 'service worker caches entry');

console.log('release-ok');

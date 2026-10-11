#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --check game.js
node --check world.js
node --check saves.js
node --test tests/*.test.cjs
mkdir -p dist
for asset in index.html style.css game.js world.js saves.js; do
  cp "$asset" "dist/$asset"
done
: > dist/.nojekyll

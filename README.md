# Mosslight Village

A gentle browser idle game about restoring a woodland village.

## Play locally

From this directory, run `python3 -m http.server 8000`. Open the server in a browser. No build step or dependencies are required.

Gather branches, plant up to five flower patches, and restore Juniper’s bakery. Gardens produce seeds; the bakery produces warmth and wood. Progress saves to browser local storage, with up to eight hours of offline earnings. Optional sound starts only when enabled.

After welcoming Juniper, build Fern’s pond for more seeds, then open Orla’s bookshop for more warmth. Add four lanterns to illuminate the path. A picnic spot appears once you have 30 warmth. Existing saves carry forward.

The canvas fills the screen and uses a separate portrait composition so buildings remain visible on phones.

## Checks

Run `node --check game.js` and `node --test tests/progression.test.cjs`.

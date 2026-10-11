# Mosslight Village

A gentle browser idle game about restoring a woodland village.

## Play locally

From this directory, run `python3 -m http.server 8000`. Open the server in a browser. No build step or dependencies are required.

Gather branches, plant up to five flower patches, and restore Juniper’s bakery. Gardens produce seeds; the bakery produces warmth and wood. Progress saves to browser local storage, with up to eight hours of offline earnings. Optional sound starts only when enabled.

After welcoming Juniper, build Fern’s pond for more seeds, then open Orla’s bookshop for more warmth. Add four lanterns to illuminate the path. A picnic spot appears once you have 30 warmth. Existing saves carry forward.

The Woodland action page continues the village: plant Clover’s orchard for 30 seeds per minute, build Alder’s workshop for 24 wood per minute, then open Hazel’s tea garden for 24 warmth per minute. Upgrade gathering tools five times (up to 13 wood per tap), trade 30 seeds for 15 wood, and host a tea picnic for 40 warmth. Picnics cost 20 wood and 40 seeds and have a five-minute cooldown that survives reloading. All six residents and their buildings appear in the pixel scene.

The canvas fills the screen and uses a separate portrait composition so buildings remain visible on phones.

## Checks

Run `node --check game.js`, `node --check world.js`, `node --check saves.js`, and `node --test tests/*.test.cjs`.

## The Mosslight Festival

The Festival action page tracks the final goal. Welcome all six neighbors, finish five flower patches and four lanterns, then restore the square in three stages: stones, flowers, and the Mosslight lantern. Hosting the festival costs 100 wood, 150 seeds, and 3,800 warmth. Upgrade every building at least once before hosting. Everyone gathers in the decorated square, floating lanterns rise, and an ending celebrates your village. Continue playing afterward, or reread the ending through Festival memories. Completion and square progress are saved automatically.

## Building upgrades and pacing

The Upgrades page gives every resident building three improvements. Each level adds 50% of the building’s base production (up to 2.5× at level three), with escalating costs and new pixel decorations. Buttons show the next income and exact cost; the supply bar shows total income per minute. Offline income uses the same upgraded rates. Older saves start with level-zero buildings; festivals already completed remain completed.

Run `node scripts/measure-pacing.cjs` to measure three reproducible progression models. Current results range from 146 to 175 simulated minutes. These models use real purchase handlers, earned resources, and accelerated elapsed time; they do not establish real player completion time. See [PACING.md](PACING.md) for assumptions.

## A living village

Residents stroll along short paths and pause to rest. Dawn, day, dusk, and night repeat every sixteen minutes; gentle rain appears in selected four-minute weather windows and fades in and out. Windows and lanterns stay warm at night. Weather and time of day never change production or damage the village.

Sound is optional and starts only after clicking its button: soft chimes, filtered wind, and rain ambience generated in the browser without downloaded assets. Audio pauses while the tab is hidden. Motion off freezes the scene in clear daylight and is remembered separately from game progress; reduced-motion browser preferences default to this calm setting.

## Backups and reset

Open **Saves** to export a JSON backup, import one, or reset your village. Imports show a progress summary and require confirmation before replacing the current game. Reset also requires confirmation; canceling either keeps your village. Motion preferences and current sound settings stay unchanged.

Backups include supplies, buildings, upgrades, picnic cooldown, square progress, festival completion, and the last save time. Restoring includes up to eight hours of offline income, using the saved production rates. Older raw save files are supported; malformed, oversized, or unsupported-version backups are rejected. Export files are versioned and contain no account information.

If local storage is unreadable, the original data is kept instead of automatically overwritten. If writing fails, imports and resets keep the current game intact; export a backup before closing the tab. A clock rollback pauses earnings until the clock catches up rather than counting the same time twice.

## Controls

Village, Woodland, Upgrades, and Festival organize the actions. A compact goal hint points to the next step; available actions have a brighter border. Use Tab to focus controls, Enter or Space to activate them, and Left/Right/Home/End to switch action pages when a page button is focused. Save dialogs keep confirmation actions separate from gameplay.

The canvas fits around the measured header and action dock. Short landscape screens show actions beside the village, while portrait screens use the vertical village composition. Control targets are at least 44 pixels high.

## Publishing

The GitHub Pages workflow validates and publishes the static distribution. See [DEPLOYMENT.md](DEPLOYMENT.md) for the one-time Pages setting and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for release gates. The website is not confirmed live yet.

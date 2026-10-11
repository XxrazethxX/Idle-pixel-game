# Progression pacing

Run `node scripts/measure-pacing.cjs` from the repository root. The simulator starts with a fresh save and calls the actual game purchase handlers. Time advances by one minute only while waiting to afford the next purchase. It does not inject resources.

All models plant one flower patch, welcome the six residents in order, finish the garden and lanterns, buy building upgrades, restore the square, and host the festival. Gathering happens while waiting. Picnic-enabled models host tea when affordable and off cooldown. They do not trade seeds, upgrade gathering tools, or optimize upgrade order; real players can progress differently. Offline earnings can replace time spent in the game.

| Model | Gather taps per waiting minute | Upgrade levels per building | Tea picnics | Bakery | All neighbors | Festival |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| Gentle play | 3 | 1 | No | 4 min | 48 min | 175 min |
| Invest in buildings | 3 | 2 | Yes | 4 min | 48 min | 152 min |
| Frequent gathering | 30 | 2 | Yes | 2 min | 46 min | 146 min |

Building levels add 50% of base production each, so investing can shorten the final stretch. Every building needs one improvement for the festival, with levels two and three optional. Final milestones depend on resources rather than a forced timer; progress is preserved and nothing deteriorates.

These are simulated elapsed times, not measured active play times. A real-time fresh-save playthrough remains required before 1.0 to evaluate long waits, meaningful choices, and the 2–3 hour target. The regression suite checks that these specific models stay within 120–180 simulated minutes.

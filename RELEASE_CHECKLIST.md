# Mosslight Village 1.0 release candidate

## Completed validation

- All 27 automated gameplay, save, world, and guidance tests pass.
- The static distribution builds with syntax checks and the gameplay suite.
- Layout review covered fresh, mid-game, and completed saves at six viewport sizes: 1440×900, 768×1024, 390×844, 320×568, 844×390, and 667×375.
- Browser checks exercised weather, audio toggles, reduced motion, backups, import/reset confirmation, corrupt saves, failed storage, and ending/free play.

## Final gates

- [x] Full fresh-save browser progression against the staged distribution: completed in 175 simulated minutes, earned resources only, with ending, save/reload, phone free play, backup download, and successful runtime asset requests.
- [ ] Real-time fresh-save pacing review. The models predict 146–175 minutes; actual elapsed player time has not been measured.
- [ ] Confirm GitHub Pages repository configuration and a successful deployment.
- [ ] Open the public site, verify every asset loads, gather wood, and confirm progress survives reload.

## Real-time review

Start with a fresh browser profile or export your save before using the confirmed reset. Record the elapsed times of the first garden, bakery, pond, bookshop, orchard, workshop, tea garden, square stages, and festival. Note long periods without an interesting choice, unreadable costs, misplaced sprites, and any pressure to click constantly. Try switching away and back, then test export/import and continued play after the ending. Keep the six-neighbor scope fixed; fix blockers before adding new systems.

A successful accelerated browser test validates progression but does not establish that the game feels good over a real 2–3 hour session. Website availability is a separate release gate.

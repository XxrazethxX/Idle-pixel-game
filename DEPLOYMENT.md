# Publish the game with GitHub Pages

The repository includes `.github/workflows/pages.yml`. Each push to `main` validates the game, stages only the five runtime files in `dist/`, and deploys that artifact to GitHub Pages. Tests, documentation, and Git metadata are excluded. There is no dependency installation or production build framework.

## One-time repository setting

1. Open this repository’s **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Actions → Publish Mosslight Village → Run workflow**, choosing `main`.
4. Wait for the build and deploy jobs to pass. Use the website URL shown in the deployment result, then test gathering and a save/reload there.

If GitHub reports Pages unavailable for this repository or account, resolve that repository/plan setting first. If Actions is disabled, enable it in the repository’s Actions settings. No third-party hosting account or secret is needed for this workflow.

## Local verification

From the repository root:

```sh
bash scripts/build-site.sh
python3 -m http.server 8000 --directory dist
```

With Playwright and Chromium available, run the optional end-to-end check against that server:

```sh
GAME_URL=http://127.0.0.1:8000 node tests/release-browser.cjs
```

Set `CHROMIUM_PATH` if Chromium is installed elsewhere. This test advances the browser clock and never injects resources. It verifies a fresh village through the festival, save/reload, phone free play, and backup download. A real-time pacing playthrough remains separate.

## Save locations

Progress belongs to the browser origin. Local development saves do not automatically appear on the published website. Export a backup from the old address and import it on the new address to carry progress across. No server or account stores your game.

## Current publication status

The workflow and built artifact have been prepared locally. The onboarding environment cannot currently reach `api.github.com` because its egress proxy denies the connection. That prevents confirming/enabling Pages or reading the remote deployment result from this session. Configuration additions for `api.github.com` and `xxrazethxx.github.io` have been saved in the environment draft; review, save, and publish the cloud environment to activate them. This is separate from publishing the game through GitHub Pages.

Do not treat a pushed workflow as proof that the website is live. Confirm the successful GitHub deployment and public website response before marking publication complete.

# snagdl.com

The website for Snag: one static page in `public/`, served by
Cloudflare as a Worker with static assets (`wrangler.jsonc`). Nothing to build; push to `main` to
publish.

The download buttons find their files in Snag's updates bucket, `updates.snagdl.com/releases/`, where the Feed workflow puts each release (`download.js`, and `_redirects` for the fixed links).
`public/_headers` sets the security headers Cloudflare sends.

Screenshots come from the app's preview mode (`npm run dev` in Snag's `frontend/`): `app.webp`
is `/preview.html` at 1280×800, `playlist.webp` the picker cropped from `/preview.html?playlist`.

`public/app/` is the web app, built from Snag's repository (`task site:app` there): signed in to a
Snag Cloud account, it sends links to the computers on it, through `cloud.snagdl.com`. Rebuild it
there after changing it; don't edit it here.

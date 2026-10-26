# snagdl.com

The website for [Snag](https://github.com/Roham1299/snag): one static page in `public/`, served by
Cloudflare as a Worker with static assets (`wrangler.jsonc`). Nothing to build; push to `main` to
publish.

The download buttons find their files in Snag's latest GitHub release (`download.js`).
`public/_headers` sets the security headers Cloudflare sends.

Screenshots come from the app's preview mode (`npm run dev` in Snag's `frontend/`): `app.webp`
is `/preview.html` at 1280×800, `playlist.webp` the picker cropped from `/preview.html?playlist`.

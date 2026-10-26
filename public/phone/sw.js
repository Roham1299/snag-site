// Snag's phone page, in the background: shows notifications, and serves a watched download to
// the video element as ranges fetched from the page (lib/remote/watch.ts).
const CHUNK = 2 * 1024 * 1024;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let note = { title: "Snag", body: "", tag: "snag" };
  try {
    note = { ...note, ...e.data.json() };
  } catch {
    // an empty push
  }
  e.waitUntil(
    self.registration.showNotification(note.title, {
      body: note.body,
      tag: note.tag,
      icon: "/phone/icon-192.png",
      badge: "/phone/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.includes("/phone/"));
      return open ? open.focus() : self.clients.openWindow("/phone/");
    }),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const match = /^\/phone\/stream\/([A-Za-z0-9_-]+)$/.exec(url.pathname);
  if (!match) return;
  e.respondWith(stream(e, match[1]));
});

async function stream(e, token) {
  const client =
    (await self.clients.get(e.clientId)) ?? (await self.clients.matchAll({ type: "window" }))[0];
  if (!client) return new Response("no page", { status: 503 });
  const range = /bytes=(\d+)-(\d*)/.exec(e.request.headers.get("range") ?? "");
  const from = range ? Number(range[1]) : 0;
  const to = range && range[2] ? Number(range[2]) : from + CHUNK - 1;
  const n = Math.min(to - from + 1, CHUNK);
  const reply = await ask(client, { type: "read", token, from, n });
  if (reply.error) return new Response(reply.error, { status: 502 });
  const { bytes, size, kind } = reply;
  if (from >= size)
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
  return new Response(bytes, {
    status: 206,
    headers: {
      "content-type": kind || "video/mp4",
      "content-length": String(bytes.length),
      "content-range": `bytes ${from}-${from + bytes.length - 1}/${size}`,
      "accept-ranges": "bytes",
      "cache-control": "no-store",
    },
  });
}

function ask(client, message) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (ev) => resolve(ev.data);
    client.postMessage(message, [channel.port2]);
    setTimeout(() => resolve({ error: "the page didn't answer" }), 60_000);
  });
}

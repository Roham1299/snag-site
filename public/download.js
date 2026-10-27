// Points the download buttons at the latest release's files, and the main button at this
// visitor's system. The Feed workflow writes release.json next to the files; without it (or
// if the bucket can't be reached) the buttons keep their fixed links, which serve the same files.
const BASE = "https://updates.snagdl.com/releases";

const LABELS = { windows: "for Windows", macos: "for macOS", deb: "for Linux" };

function systemOf(ua) {
  if (/Windows/.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/.test(ua) && !/iPhone|iPad/.test(ua)) return "macos";
  if (/Linux/.test(ua) && !/Android/.test(ua)) return "deb";
  return null;
}

async function main() {
  const res = await fetch(`${BASE}/latest/release.json`, { cache: "no-cache" });
  if (res.status === 404) {
    document.getElementById("version").textContent = "The next release is on its way.";
    document.getElementById("get-note").textContent = "The next release is on its way.";
    return;
  }
  if (!res.ok) return;
  const release = await res.json();
  const urls = {};
  for (const [kind, name] of Object.entries(release.files || {})) {
    urls[kind] = `${BASE}/v${release.version}/${name}`;
  }
  for (const link of document.querySelectorAll("[data-asset]")) {
    if (urls[link.dataset.asset]) link.href = urls[link.dataset.asset];
  }
  if (urls.sums) document.getElementById("sums").href = urls.sums;
  if (urls.firefox) document.getElementById("firefox").hidden = false;
  document.getElementById("version").textContent = `Snag ${release.version}`;

  const system = systemOf(navigator.userAgent);
  if (system && urls[system]) {
    const get = document.getElementById("get");
    get.href = urls[system];
    get.textContent = `Download ${LABELS[system]}`;
    document.getElementById("get-note").textContent =
      `Snag ${release.version}, free to use. Other systems below.`;
  }
}

main().catch(() => {});

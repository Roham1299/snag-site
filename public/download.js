// Points the download buttons at the latest release's files, and the main button at this
// visitor's system. Without a release (or if GitHub can't be reached) they stay on the releases page.
const REPO = "Roham1299/snag";

const ASSETS = {
  windows: /windows-amd64-setup\.exe$/,
  macos: /macos\.dmg$/,
  deb: /_amd64\.deb$/,
  rpm: /\.rpm$/,
  arch: /\.pkg\.tar\.zst$/,
  sums: /^SHA256SUMS$/,
  firefox: /^snag-firefox-[\d.]+\.xpi$/, // signed; the unsigned one says so in its name
};

const LABELS = { windows: "for Windows", macos: "for macOS", deb: "for Linux" };

function systemOf(ua) {
  if (/Windows/.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/.test(ua) && !/iPhone|iPad/.test(ua)) return "macos";
  if (/Linux/.test(ua) && !/Android/.test(ua)) return "deb";
  return null;
}

async function main() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
  if (res.status === 404) {
    document.getElementById("version").textContent = "The next release is on its way.";
    document.getElementById("get-note").textContent = "The next release is on its way.";
    return;
  }
  if (!res.ok) return;
  const release = await res.json();
  const urls = {};
  for (const [key, pattern] of Object.entries(ASSETS)) {
    const asset = release.assets.find((a) => pattern.test(a.name));
    if (asset) urls[key] = asset.browser_download_url;
  }
  for (const link of document.querySelectorAll("[data-asset]")) {
    if (urls[link.dataset.asset]) link.href = urls[link.dataset.asset];
  }
  if (urls.sums) document.getElementById("sums").href = urls.sums;
  if (urls.firefox) document.getElementById("firefox").hidden = false;
  document.getElementById("version").textContent = `Snag ${release.tag_name.replace(/^v/, "")}`;

  const system = systemOf(navigator.userAgent);
  if (system && urls[system]) {
    const get = document.getElementById("get");
    get.href = urls[system];
    get.textContent = `Download ${LABELS[system]}`;
    document.getElementById("get-note").textContent =
      `Snag ${release.tag_name.replace(/^v/, "")}, free to use. Other systems below.`;
  }
}

main().catch(() => {});

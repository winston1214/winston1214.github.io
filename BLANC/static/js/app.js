/* ===== BLANC project page interactions ===== */

/*
 * Video Results
 * Clips live at: static/videos/<exampleId>/<methodId>.mp4
 * To add an example, drop four clips into a new folder and append to VIDEO_EXAMPLES.
 */
const METHODS = [
  { id: "gt",        label: "Ground Truth", ref: true },
  { id: "blanc",     label: "BLANC (Ours)", ours: true },
  { id: "soke",      label: "SOKE" },
  { id: "signspark", label: "SignSparK" },
];

const VIDEO_EXAMPLES = [
  {
    id: "phoenix",
    label: "PHOENIX-2014T",
    prompt: "und nun die wettervorhersage für morgen montag den vierundzwanzigsten januar zweitausendelf",
    translation: "And now the weather forecast for tomorrow, Monday, the twenty-fourth of January 2011.",
  },
  {
    id: "csl",
    label: "CSL-Daily",
    prompt: "今天的晚饭是面条和饺子。",
    translation: "Today's dinner is noodles and dumplings.",
  },
];

function buildPanel(exampleId, method) {
  const fig = document.createElement("figure");
  fig.className = "method-cell" + (method.ours ? " ours" : "");

  const tag = document.createElement("span");
  tag.className = "tag" + (method.ours ? " ours" : method.ref ? " ref" : "");
  tag.textContent = method.label;
  fig.appendChild(tag);

  const video = document.createElement("video");
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("aria-label", method.label);
  video.src = `static/videos/${exampleId}/${method.id}.mp4`;
  fig.appendChild(video);
  return fig;
}

function showExample(idx) {
  const ex = VIDEO_EXAMPLES[idx];
  document.querySelectorAll("#example-pills .pill").forEach((b, i) => {
    b.classList.toggle("active", i === idx);
    b.setAttribute("aria-selected", i === idx);
  });
  document.getElementById("example-prompt").textContent = `“${ex.prompt}”`;
  document.getElementById("example-sub").textContent = ex.translation || "";

  const grid = document.getElementById("method-grid");
  grid.innerHTML = "";
  const videos = METHODS.map(m => {
    const fig = buildPanel(ex.id, m);
    grid.appendChild(fig);
    return fig.querySelector("video");
  });
  // Restart all panels together once every clip can play, so they stay in sync.
  let ready = 0;
  videos.forEach(v => v.addEventListener("canplay", () => {
    if (++ready === videos.length) videos.forEach(x => { x.currentTime = 0; x.play().catch(() => {}); });
  }, { once: true }));
}

(function initVideos() {
  const pills = document.getElementById("example-pills");
  if (!pills) return;
  const sub = document.createElement("p");
  sub.className = "prompt-sub";
  sub.id = "example-sub";
  document.getElementById("example-prompt").after(sub);
  VIDEO_EXAMPLES.forEach((ex, i) => {
    const b = document.createElement("button");
    b.className = "pill";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = ex.label;
    b.addEventListener("click", () => showExample(i));
    pills.appendChild(b);
  });
  showExample(0);
})();

// Qualitative figure tabs
document.querySelectorAll("[data-tabs]").forEach(group => {
  const tabs = group.querySelectorAll(".tab");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      document.getElementById(t.dataset.target).hidden = !on;
    });
  }));
});

// Copy BibTeX
const copyBtn = document.getElementById("copy-bib");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const text = document.getElementById("bibtex").innerText;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
    } catch (e) {
      copyBtn.textContent = "Select & copy";
    }
    setTimeout(() => (copyBtn.textContent = "Copy"), 1600);
  });
}

// Day / night theme toggle. Follows the system setting until the visitor picks one.
(function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.getAttribute("data-theme") || (media.matches ? "dark" : "light");
  const sync = () => {
    const dark = current() === "dark";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.title = dark ? "Light mode" : "Dark mode";
  };
  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("blanc-theme", next); } catch (e) {}
    sync();
  });
  media.addEventListener("change", sync);
  sync();
})();

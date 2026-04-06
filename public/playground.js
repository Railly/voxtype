// src/web/app.ts
var themes = {
  default: { top: "#93c5fd", front: "#60a5fa", side: "#3b82f6" },
  catppuccin: { top: "#cba6f7", front: "#b4befe", side: "#89b4fa" },
  "one-hunter": { top: "#e06c75", front: "#c678dd", side: "#61afef" },
  dracula: { top: "#ff79c6", front: "#bd93f9", side: "#8be9fd" },
  mono: { top: "#e5e5e5", front: "#a3a3a3", side: "#737373" },
  "mono-dark": { top: "#525252", front: "#404040", side: "#262626" },
  emerald: { top: "#6ee7b7", front: "#34d399", side: "#10b981" },
  sunset: { top: "#fbbf24", front: "#f59e0b", side: "#ef4444" }
};
var presets = {
  logo: {
    text: "VOXTYPE",
    mode: "voxel",
    theme: "catppuccin",
    depth: 4,
    resolution: 18,
    tile: 10,
    plotter: false
  },
  sticker: {
    text: "HELLO",
    mode: "voxel",
    theme: "sunset",
    depth: 2,
    resolution: 14,
    tile: 12,
    plotter: false
  },
  "pen-plotter": {
    text: "PLOTTER",
    mode: "voxel",
    theme: "default",
    depth: 3,
    resolution: 16,
    tile: 8,
    plotter: true
  },
  retro: {
    text: "PIXEL",
    mode: "voxel",
    theme: "emerald",
    depth: 5,
    resolution: 10,
    tile: 14,
    plotter: false
  },
  neon: {
    text: "NEON",
    mode: "voxel",
    theme: "dracula",
    depth: 3,
    resolution: 16,
    tile: 10,
    plotter: false
  },
  chunky: {
    text: "BIG",
    mode: "voxel",
    theme: "one-hunter",
    depth: 6,
    resolution: 8,
    tile: 18,
    plotter: false
  },
  minimal: {
    text: "MONO",
    mode: "voxel",
    theme: "mono-dark",
    depth: 2,
    resolution: 20,
    tile: 8,
    plotter: false
  }
};
var state = {
  text: "HELLO",
  mode: "voxel",
  theme: "default",
  projection: "isometric",
  angle: 315,
  size: 72,
  depth: 3,
  resolution: 20,
  tile: 8,
  plotter: false,
  noBackground: true
};
var currentSvg = "";
var debounceTimer = null;
var renderVersion = 0;
var $ = (sel) => document.querySelector(sel);
function buildThemeGrid() {
  const grid = $("#theme-grid");
  for (const [name, colors] of Object.entries(themes)) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = `theme-swatch${name === state.theme ? " active" : ""}`;
    swatch.dataset.theme = name;
    swatch.title = name;
    swatch.innerHTML = `
      <div class="swatch-top" style="background:${colors.top}"></div>
      <div class="swatch-front" style="background:${colors.front}"></div>
      <div class="swatch-side" style="background:${colors.side}"></div>
    `;
    swatch.addEventListener("click", () => {
      state.theme = name;
      for (const s of grid.querySelectorAll(".theme-swatch")) {
        s.classList.remove("active");
      }
      swatch.classList.add("active");
      render();
    });
    grid.appendChild(swatch);
  }
}
function buildPresets() {
  const container = $("#presets");
  for (const [name, preset] of Object.entries(presets)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-btn";
    btn.textContent = name;
    btn.addEventListener("click", () => {
      Object.assign(state, preset);
      syncUIToState();
      render();
    });
    container.appendChild(btn);
  }
}
function syncUIToState() {
  $("#text-input").value = state.text;
  $("#angle-slider").value = String(state.angle);
  $("#angle-value").textContent = String(state.angle);
  $("#depth-slider").value = String(state.depth);
  $("#depth-value").textContent = String(state.depth);
  $("#resolution-slider").value = String(state.resolution);
  $("#resolution-value").textContent = String(state.resolution);
  $("#tile-slider").value = String(state.tile);
  $("#tile-value").textContent = String(state.tile);
  $("#plotter-check").checked = state.plotter;
  $("#nobg-check").checked = state.noBackground;
  document.querySelectorAll("#mode-toggle .toggle").forEach((b) => {
    b.classList.toggle("active", b.dataset.value === state.mode);
  });
  document.querySelectorAll("#projection-toggle .toggle").forEach((b) => {
    b.classList.toggle("active", b.dataset.value === state.projection);
  });
  document.querySelectorAll(".theme-swatch").forEach((s) => {
    s.classList.toggle("active", s.dataset.theme === state.theme);
  });
  $("#resolution-group").style.display = state.mode === "extrude" ? "none" : "flex";
}
function setupToggles(id, key) {
  const group = $(`#${id}`);
  group.querySelectorAll(".toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      state[key] = btn.dataset.value;
      for (const b of group.querySelectorAll(".toggle")) {
        b.classList.remove("active");
      }
      btn.classList.add("active");
      if (key === "mode") {
        $("#resolution-group").style.display = btn.dataset.value === "extrude" ? "none" : "flex";
        if (btn.dataset.value === "extrude" && state.depth < 6) {
          state.depth = 8;
          $("#depth-slider").value = "8";
          $("#depth-value").textContent = "8";
        }
      }
      render();
    });
  });
}
function setupSlider(sliderId, valueId, key) {
  const slider = $(`#${sliderId}`);
  const display = $(`#${valueId}`);
  slider.addEventListener("input", () => {
    const val = Number.parseInt(slider.value, 10);
    state[key] = val;
    display.textContent = String(val);
    debouncedRender();
  });
}
function debouncedRender(delay = 150) {
  if (debounceTimer)
    clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, delay);
}
function updateURL() {
  const params = new URLSearchParams;
  for (const [k, v] of Object.entries(state)) {
    if (v !== false && v !== "")
      params.set(k, String(v));
  }
  history.replaceState(null, "", `?${params}`);
}
function loadFromURL() {
  const params = new URLSearchParams(location.search);
  if (params.has("text"))
    state.text = params.get("text");
  if (params.has("mode"))
    state.mode = params.get("mode");
  if (params.has("theme"))
    state.theme = params.get("theme");
  if (params.has("projection"))
    state.projection = params.get("projection");
  if (params.has("angle"))
    state.angle = Number(params.get("angle"));
  if (params.has("size"))
    state.size = Number(params.get("size"));
  if (params.has("depth"))
    state.depth = Number(params.get("depth"));
  if (params.has("resolution"))
    state.resolution = Number(params.get("resolution"));
  if (params.has("tile"))
    state.tile = Number(params.get("tile"));
  if (params.has("plotter"))
    state.plotter = params.get("plotter") === "true";
  if (params.has("noBackground"))
    state.noBackground = params.get("noBackground") === "true";
}
async function render() {
  const version = ++renderVersion;
  const container = $("#svg-container");
  container.classList.add("loading");
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state)
  });
  if (version !== renderVersion)
    return;
  const svg = await res.text();
  currentSvg = svg;
  container.innerHTML = svg;
  container.classList.remove("loading");
  const sizeKB = (new Blob([svg]).size / 1024).toFixed(1);
  $("#file-size").textContent = `${sizeKB} KB`;
  updateURL();
}
function setupActions() {
  $("#download-btn").addEventListener("click", () => {
    if (!currentSvg)
      return;
    const blob = new Blob([currentSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voxtype-${state.text.toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  });
  $("#copy-btn").addEventListener("click", async () => {
    if (!currentSvg)
      return;
    await navigator.clipboard.writeText(currentSvg);
    const btn = $("#copy-btn");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy SVG";
    }, 1500);
  });
  $("#share-btn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(location.href);
    const btn = $("#share-btn");
    btn.textContent = "Link copied!";
    setTimeout(() => {
      btn.textContent = "Share URL";
    }, 1500);
  });
}
var textInput = $("#text-input");
textInput.addEventListener("input", () => {
  state.text = textInput.value || "HELLO";
  debouncedRender();
});
var plotterCheck = $("#plotter-check");
plotterCheck.addEventListener("change", () => {
  state.plotter = plotterCheck.checked;
  render();
});
var nobgCheck = $("#nobg-check");
nobgCheck.addEventListener("change", () => {
  state.noBackground = nobgCheck.checked;
  render();
});
loadFromURL();
buildThemeGrid();
buildPresets();
syncUIToState();
setupToggles("mode-toggle", "mode");
setupToggles("projection-toggle", "projection");
setupSlider("angle-slider", "angle-value", "angle");
setupSlider("depth-slider", "depth-value", "depth");
setupSlider("resolution-slider", "resolution-value", "resolution");
setupSlider("tile-slider", "tile-value", "tile");
setupActions();
render();

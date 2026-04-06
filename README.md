```
 __   __  _______  __   __  _______  __   __  _______  _______
|  | |  ||       ||  |_|  ||       ||  | |  ||       ||       |
|  |_|  ||   _   ||       ||_     _||  |_|  ||    _  ||    ___|
|       ||  | |  ||       |  |   |  |       ||   |_| ||   |___
|       ||  |_|  | |     |   |   |  |_     _||    ___||    ___|
 |     | |       ||   _   |  |   |    |   |  |   |    |   |___
  |___|  |_______||__| |__|  |___|    |___|  |___|    |_______|
```

**3D typography in pure SVG.** Turn any text into voxel sculptures or extruded letterforms — zero canvas, zero WebGL, just math and vectors.

---

## Install

```bash
npx voxtype "HELLO"
```

Or install globally:

```bash
npm install -g voxtype
# or
bun add -g voxtype
```

---

## Quick start

```bash
# Voxel mode (default) — block letter sculpture
voxtype "HELLO" -o out.svg

# Extrude mode — smooth extruded outlines
voxtype "HELLO" --mode extrude -o out.svg

# With theme and projection
voxtype "VOXTYPE" --theme catppuccin --projection oblique -o out.svg

# Pen plotter output — stroke only, no fill
voxtype "PLOT" --plotter -o plotter.svg
```

---

## Modes

### voxel

Rasterizes glyphs into a grid, then stacks voxel cubes in 3D. Each character becomes a block sculpture rendered with isometric or oblique projection.

```bash
voxtype "CODE" --mode voxel --resolution 20 --tile 8 --depth 3
```

- `--resolution` — grid height in voxels (detail level)
- `--tile` — size of each voxel cube in SVG units
- `--depth` — how tall the voxel stack is

### extrude

Traces the actual glyph outlines, extrudes them along the projection axis, and renders visible faces with Phong-inspired shading. Produces smooth, typographic 3D letterforms.

```bash
voxtype "TYPE" --mode extrude --depth 8 --tile 10
```

- `--depth` — extrusion depth (higher = thicker letterforms)
- `--tile` — scale factor for the extrusion geometry

---

## Themes

| Name         | Description                           |
|--------------|---------------------------------------|
| `default`    | Blue gradient, no background          |
| `catppuccin` | Mocha palette, dark `#1e1e2e` bg      |
| `one-hunter` | Red/purple/blue, VS Code inspired     |
| `dracula`    | Pink/purple/cyan on `#282a36`         |
| `mono`       | Grayscale, light                      |
| `mono-dark`  | Grayscale, near-black `#0a0a0a` bg    |
| `emerald`    | Green tones, no background            |
| `sunset`     | Amber/red on `#1c1917`                |

```bash
voxtype "DARK" --theme mono-dark
voxtype "BLOOM" --theme emerald
voxtype "NIGHT" --theme dracula
```

---

## Projections

| Name         | Description                                      |
|--------------|--------------------------------------------------|
| `isometric`  | Classic isometric — equal angles, no perspective |
| `oblique`    | Cabinet oblique — front face undistorted         |

```bash
voxtype "ISO" --projection isometric
voxtype "OBL" --projection oblique
```

---

## Plotter mode

Stroke-only output, black on white, no fill. Ready for pen plotters or laser cutters.

```bash
voxtype "HELLO" --plotter -o plotter.svg
```

---

## All options

```
Usage: voxtype [options] <text>

Arguments:
  text                  Text to render

Options:
  -V, --version         output the version number
  --font <path>         Path to .ttf or .otf font file
  --size <px>           Font size in px (default: "72")
  --mode <type>         Render mode: voxel, extrude (default: "voxel")
  --resolution <n>      Grid height in voxels (default: "20")
  --depth <n>           Extrusion depth (default: "3")
  --tile <n>            Tile size in SVG units (default: "8")
  --theme <name>        Color theme (default: "default")
  --projection <type>   Projection type (default: "isometric")
  --plotter             Stroke-only mode for pen plotters (default: false)
  -o, --output <path>   Output file (default: stdout)
  -h, --help            display help
```

---

## Web preview

Start the local server for a live interactive playground:

```bash
bun dev
# http://localhost:3333
```

- Type any text and see the SVG update in real time
- Switch modes, themes, projections instantly
- Download SVG or copy to clipboard
- Shareable URLs — state encoded in query params
- 5 built-in presets: logo, sticker, pen-plotter, retro, smooth

---

## Custom fonts

Pass any `.ttf` or `.otf` file:

```bash
voxtype "CUSTOM" --font /path/to/font.ttf -o out.svg
```

Without `--font`, voxtype falls back to system fonts (SF Pro on macOS, Arial on Windows).

---

## Output

All output is pure SVG — no raster images, no external dependencies. The SVG can be:

- Embedded directly in HTML
- Opened in Figma, Inkscape, or Illustrator
- Sent to a pen plotter (with `--plotter`)
- Animated with CSS or JS
- Scaled to any size without quality loss

---

## License

MIT — Railly Hugo

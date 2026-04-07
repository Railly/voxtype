import sharp from "sharp";
import { renderExtruded } from "../src/extrude.ts";
import { getGlyphPaths, loadFont } from "../src/font.ts";
import { rasterizeGlyphs } from "../src/rasterize.ts";
import { buildVoxelScene, projections, renderSVG } from "../src/scene.ts";
import { resolveTheme } from "../src/themes.ts";

const AMBER = "#f59e0b";
const AMBER_DIM = "#b45309";
const ZINC_900 = "#18181b";
const ZINC_950 = "#09090b";
const WHITE = "#fafafa";
const MUTED = "#71717a";

const font = loadFont();

function generateHeroVoxelSVG(text: string): string {
	const glyphPath = getGlyphPaths(font, text, 72);
	const raster = rasterizeGlyphs(glyphPath, 18);
	const theme = resolveTheme("sunset", false);
	theme.background = undefined;
	const scene = buildVoxelScene(raster, {
		depth: 4,
		tile: 10,
		theme,
		projection: projections.isometric,
	});
	return renderSVG(scene);
}

function extractSvgInner(svg: string): { inner: string; viewBox: string } {
	const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
	const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";
	const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
	const inner = innerMatch ? innerMatch[1] : "";
	return { inner, viewBox };
}

function ogSvg(width: number, height: number): string {
	const hero = generateHeroVoxelSVG("VOXTYPE");
	const { inner, viewBox } = extractSvgInner(hero);
	const [vx, vy, vw, vh] = viewBox.split(" ").map(Number);

	const targetW = width * 0.72;
	const targetH = height * 0.5;
	const scale = Math.min(targetW / vw, targetH / vh);
	const renderedW = vw * scale;
	const renderedH = vh * scale;
	const offsetX = (width - renderedW) / 2;
	const offsetY = height * 0.18;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ZINC_950}"/>
      <stop offset="100%" stop-color="${ZINC_900}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>

  <!-- Top left: logo + wordmark -->
  <g transform="translate(48, 48)">
    <g transform="translate(0, -4)">
      <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" fill="${AMBER_DIM}" stroke="${AMBER}" stroke-width="2"/>
      <line x1="14" y1="0" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
      <line x1="0" y1="8" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
      <line x1="28" y1="8" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
    </g>
    <text x="42" y="22" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="20" font-weight="700" fill="${WHITE}">vox<tspan fill="${AMBER}">type</tspan></text>
  </g>

  <!-- Hero voxel text -->
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale}) translate(${-vx}, ${-vy})">
    ${inner}
  </g>

  <!-- Tagline bottom -->
  <text x="${width / 2}" y="${height - 90}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="26" font-weight="600" fill="${WHITE}" letter-spacing="-0.5">3D typography in pure SVG</text>
  <text x="${width / 2}" y="${height - 56}" text-anchor="middle" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="15" fill="${MUTED}">npx @crafter/voxtype "HELLO"</text>

  <!-- Bottom accent bar -->
  <rect x="60" y="${height - 4}" width="${width - 120}" height="4" rx="2" fill="url(#accent)" opacity="0.7"/>
</svg>`;
}

function faviconSvg(): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="${ZINC_950}"/>
  <g transform="translate(10, 6)">
    <polygon points="14,0 28,8 28,24 14,32 0,24 0,8" fill="${AMBER_DIM}" stroke="${AMBER}" stroke-width="2"/>
    <line x1="14" y1="0" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
    <line x1="0" y1="8" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
    <line x1="28" y1="8" x2="14" y2="16" stroke="${AMBER}" stroke-width="1.5" opacity="0.6"/>
  </g>
</svg>`;
}

const og = Buffer.from(ogSvg(1200, 630));
const ogTwitter = Buffer.from(ogSvg(1200, 600));
const favicon = Buffer.from(faviconSvg());

await Promise.all([
	sharp(og).png().toFile("public/og.png"),
	sharp(ogTwitter).png().toFile("public/og-twitter.png"),
	sharp(og).png().toFile("src/web/assets/og.png"),
	sharp(ogTwitter).png().toFile("src/web/assets/og-twitter.png"),
]);

const fav16 = await sharp(favicon).resize(16, 16).png().toBuffer();
const fav32 = await sharp(favicon).resize(32, 32).png().toBuffer();
const fav48 = await sharp(favicon).resize(48, 48).png().toBuffer();

const { default: toIco } = await import("to-ico");
const ico = await toIco([fav16, fav32, fav48]);
await Bun.write("public/favicon.ico", ico);
await Bun.write("src/web/assets/favicon.ico", ico);

console.log("Generated:");
console.log("  public/og.png (1200x630)");
console.log("  public/og-twitter.png (1200x600)");
console.log("  public/favicon.ico (multi-size)");
console.log("  Mirrored to src/web/assets/");

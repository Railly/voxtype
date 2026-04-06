import sharp from "sharp";

const AMBER = "#f59e0b";
const AMBER_DIM = "#b45309";
const ZINC_900 = "#18181b";
const ZINC_950 = "#09090b";
const WHITE = "#fafafa";
const MUTED = "#71717a";

function ogSvg(width: number, height: number): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ZINC_950}"/>
      <stop offset="100%" stop-color="${ZINC_900}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.1"/>
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
  <rect x="60" y="${height - 4}" width="${width - 120}" height="4" rx="2" fill="url(#accent)" opacity="0.6"/>

  <!-- Voxel cube icon -->
  <g transform="translate(${width / 2 - 20}, ${height * 0.2})">
    <polygon points="20,0 40,12 40,36 20,48 0,36 0,12" fill="none" stroke="${AMBER}" stroke-width="2.5" opacity="0.8"/>
    <line x1="20" y1="0" x2="20" y2="24" stroke="${AMBER}" stroke-width="2" opacity="0.5"/>
    <line x1="0" y1="12" x2="20" y2="24" stroke="${AMBER}" stroke-width="2" opacity="0.5"/>
    <line x1="40" y1="12" x2="20" y2="24" stroke="${AMBER}" stroke-width="2" opacity="0.5"/>
  </g>

  <text x="${width / 2}" y="${height * 0.58}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="${WHITE}" letter-spacing="-1">voxtype</text>
  <text x="${width / 2}" y="${height * 0.72}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="${MUTED}">3D typography in pure SVG</text>
  <text x="${width / 2}" y="${height * 0.84}" text-anchor="middle" font-family="monospace" font-size="14" fill="${AMBER}" opacity="0.7">npx voxtype "HELLO" -o hello.svg</text>
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
	sharp(og).png().toFile("src/web/assets/og.png"),
	sharp(ogTwitter).png().toFile("src/web/assets/og-twitter.png"),
	sharp(favicon).resize(48, 48).png().toFile("/tmp/vt-fav-48.png"),
]);

const fav16 = await sharp(favicon).resize(16, 16).png().toBuffer();
const fav32 = await sharp(favicon).resize(32, 32).png().toBuffer();
const fav48 = await sharp(favicon).resize(48, 48).png().toBuffer();

const { default: toIco } = await import("to-ico");
const ico = await toIco([fav16, fav32, fav48]);
await Bun.write("src/web/assets/favicon.ico", ico);

console.log("Generated: src/web/assets/og.png, og-twitter.png, favicon.ico");

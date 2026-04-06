import opentype from "opentype.js";

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_FONT_PATHS = [
	resolve(__dirname, "../fonts/Inter-Bold.ttf"),
	"/System/Library/Fonts/SFNS.ttf",
	"/System/Library/Fonts/Supplemental/Arial.ttf",
	"/System/Library/Fonts/Geneva.ttf",
];

export function loadFont(fontPath?: string): opentype.Font {
	if (fontPath) {
		return opentype.loadSync(fontPath);
	}
	for (const path of DEFAULT_FONT_PATHS) {
		try {
			return opentype.loadSync(path);
		} catch {}
	}
	throw new Error("No default font found. Provide a font path with --font.");
}

export interface GlyphGrid {
	width: number;
	height: number;
	grid: Uint8Array;
}

export function getGlyphPaths(
	font: opentype.Font,
	text: string,
	fontSize: number,
): opentype.Path {
	return font.getPath(text, 0, 0, fontSize);
}

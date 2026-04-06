import { renderExtruded } from "../src/extrude.ts";
import { getGlyphPaths, loadFont } from "../src/font.ts";
import { rasterizeGlyphs } from "../src/rasterize.ts";
import { buildVoxelScene, projections, renderSVG } from "../src/scene.ts";
import { resolveTheme } from "../src/themes.ts";

let font: ReturnType<typeof loadFont>;

export default async function handler(req: Request) {
	if (req.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	if (!font) font = loadFont();

	const body = await req.json();
	const {
		text = "HELLO",
		mode = "voxel",
		theme: themeName = "default",
		projection: projName = "isometric",
		angle = 315,
		depth = 3,
		resolution = 20,
		tile = 8,
		size = 72,
		plotter = false,
		noBackground = true,
	} = body;

	const theme = resolveTheme(themeName, plotter);
	if (noBackground) theme.background = undefined;
	const baseProjection = projections[projName];
	if (!baseProjection) {
		return Response.json({ error: "Invalid projection" }, { status: 400 });
	}
	const projection = { ...baseProjection, angle: Number(angle) };

	const glyphPath = getGlyphPaths(font, text, size);
	let svg: string;

	if (mode === "extrude") {
		const scale = tile / 10;
		svg = renderExtruded(glyphPath, depth, scale, theme, projection);
	} else {
		const raster = rasterizeGlyphs(glyphPath, resolution);
		const scene = buildVoxelScene(raster, {
			depth,
			tile,
			theme,
			projection,
		});
		svg = renderSVG(scene, theme.background);
	}

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=3600",
		},
	});
}

export const config = { runtime: "nodejs" };

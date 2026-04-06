import { renderExtruded } from "./extrude.ts";
import { getGlyphPaths, loadFont } from "./font.ts";
import { rasterizeGlyphs } from "./rasterize.ts";
import { buildVoxelScene, projections, renderSVG } from "./scene.ts";
import { resolveTheme } from "./themes.ts";
import index from "./web/index.html";

const font = loadFont();

Bun.serve({
	port: 3333,
	routes: {
		"/": index,
		"/api/render": {
			POST: async (req) => {
				const body = await req.json();
				const {
					text = "HELLO",
					mode = "voxel",
					theme: themeName = "default",
					projection: projName = "isometric",
					depth = 3,
					resolution = 20,
					tile = 8,
					size = 72,
					plotter = false,
				} = body;

				const theme = resolveTheme(themeName, plotter);
				const projection = projections[projName];
				if (!projection) {
					return Response.json(
						{ error: "Invalid projection" },
						{ status: 400 },
					);
				}

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
					headers: { "Content-Type": "image/svg+xml" },
				});
			},
		},
	},
	development: { hmr: true, console: true },
});

console.log("voxtype running at http://localhost:3333");

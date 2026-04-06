import { renderExtruded } from "./extrude.ts";
import { getGlyphPaths, loadFont } from "./font.ts";
import { rasterizeGlyphs } from "./rasterize.ts";
import { buildVoxelScene, projections, renderSVG } from "./scene.ts";
import { resolveTheme } from "./themes.ts";
import playground from "./web/index.html";

const font = loadFont();
const landingHtml = await Bun.file(
	`${import.meta.dir}/web/landing.html`,
).text();

Bun.serve({
	port: 3333,
	routes: {
		"/": new Response(landingHtml, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		}),
		"/playground": playground,
		"/api/render": {
			POST: async (req) => {
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
					return Response.json(
						{ error: "Invalid projection" },
						{ status: 400 },
					);
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
					headers: { "Content-Type": "image/svg+xml" },
				});
			},
		},
	},
	fetch(req) {
		const url = new URL(req.url);
		if (url.pathname.startsWith("/assets/")) {
			const filePath = `${import.meta.dir}/web${url.pathname}`;
			return new Response(Bun.file(filePath));
		}
		return new Response("Not found", { status: 404 });
	},
	development: { hmr: true, console: true },
});

console.log("voxtype running at http://localhost:3333");

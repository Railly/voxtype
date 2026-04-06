#!/usr/bin/env bun
import { program } from "commander";
import { renderExtruded } from "./extrude.ts";
import { getGlyphPaths, loadFont } from "./font.ts";
import { rasterizeGlyphs } from "./rasterize.ts";
import { buildVoxelScene, projections, renderSVG } from "./scene.ts";
import { resolveTheme, themes } from "./themes.ts";

const themeNames = Object.keys(themes).join(", ");
const projectionNames = Object.keys(projections).join(", ");

program
	.name("voxtype")
	.description("3D typography in pure SVG")
	.version("0.1.0")
	.argument("<text>", "Text to render")
	.option("--font <path>", "Path to .ttf or .otf font file")
	.option("--size <px>", "Font size in px", "72")
	.option("--mode <type>", "Render mode (voxel, extrude)", "voxel")
	.option("--resolution <n>", "Grid height in voxels", "20")
	.option("--depth <n>", "Extrusion depth", "3")
	.option("--tile <n>", "Tile size in SVG units", "8")
	.option("--theme <name>", `Color theme (${themeNames})`, "default")
	.option(
		"--projection <type>",
		`Projection type (${projectionNames})`,
		"isometric",
	)
	.option("--plotter", "Stroke-only mode for pen plotters", false)
	.option("-o, --output <path>", "Output file (default: stdout)")
	.action(async (text: string, opts) => {
		const font = loadFont(opts.font);
		const fontSize = Number.parseInt(opts.size, 10);
		const depth = Number.parseInt(opts.depth, 10);
		const tile = Number.parseInt(opts.tile, 10);
		const theme = resolveTheme(opts.theme, opts.plotter);
		const projection = projections[opts.projection];

		if (!projection) {
			console.error(
				`Unknown projection "${opts.projection}". Available: ${projectionNames}`,
			);
			process.exit(1);
		}

		const glyphPath = getGlyphPaths(font, text, fontSize);
		let svg: string;

		if (opts.mode === "extrude") {
			const scale = tile / 10;
			svg = renderExtruded(glyphPath, depth, scale, theme, projection);
		} else {
			const resolution = Number.parseInt(opts.resolution, 10);
			const raster = rasterizeGlyphs(glyphPath, resolution);
			const scene = buildVoxelScene(raster, {
				depth,
				tile,
				theme,
				projection,
			});
			svg = renderSVG(scene, theme.background);
		}

		if (opts.output) {
			await Bun.write(opts.output, svg);
			process.stderr.write(`Written to ${opts.output}\n`);
		} else {
			process.stdout.write(svg);
		}
	});

program.parse();

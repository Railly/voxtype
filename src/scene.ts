import { Heerich } from "heerich";
import type { RasterResult } from "./rasterize.ts";
import type { Theme } from "./themes.ts";
import { themeToHeerichStyle } from "./themes.ts";

export interface ProjectionConfig {
	type: "isometric" | "oblique" | "perspective";
	angle: number;
	distance?: number;
}

export const projections: Record<string, ProjectionConfig> = {
	isometric: { type: "isometric", angle: 315 },
	oblique: { type: "oblique", angle: 45, distance: 15 },
	perspective: { type: "perspective", angle: 45, distance: 12 },
};

export interface SceneOptions {
	depth: number;
	tile: number;
	theme: Theme;
	projection: ProjectionConfig;
}

export function buildVoxelScene(
	raster: RasterResult,
	options: SceneOptions,
): Heerich {
	const { grid, width, height } = raster;
	const { depth, tile, theme, projection } = options;

	const camera: Record<string, unknown> = {
		type: projection.type,
		angle: projection.angle,
	};
	if (projection.distance != null) camera.distance = projection.distance;
	if (projection.type === "perspective") {
		camera.position = [width / 2, height / 2];
	}

	const h = new Heerich({ tile, camera });

	if (width === 0 || height === 0) return h;

	const style = themeToHeerichStyle(theme);

	h.addGeometry({
		type: "fill",
		bounds: [
			[0, 0, 0],
			[width, height, depth],
		],
		test: (x: number, y: number, _z: number) => {
			if (x < 0 || x >= width || y < 0 || y >= height) return false;
			return grid[y * width + x] === 1;
		},
		style,
	});

	return h;
}

export function renderSVG(scene: Heerich, background?: string): string {
	const svg = scene.toSVG({ occlusion: false });
	if (!background) return svg;

	return svg.replace(
		/style="([^"]*?);?"/,
		`style="$1;background:${background}"`,
	);
}

import type opentype from "opentype.js";
import { contourBounds, flattenPath, type Point2D } from "./geometry.ts";

export interface RasterResult {
	grid: Uint8Array;
	width: number;
	height: number;
}

function windingNumber(px: number, py: number, contours: Point2D[][]): number {
	let wn = 0;
	for (const contour of contours) {
		for (let i = 0; i < contour.length; i++) {
			const p1 = contour[i]!;
			const p2 = contour[(i + 1) % contour.length]!;

			if (p1.y <= py) {
				if (p2.y > py) {
					const cross =
						(p2.x - p1.x) * (py - p1.y) - (px - p1.x) * (p2.y - p1.y);
					if (cross > 0) wn++;
				}
			} else {
				if (p2.y <= py) {
					const cross =
						(p2.x - p1.x) * (py - p1.y) - (px - p1.x) * (p2.y - p1.y);
					if (cross < 0) wn--;
				}
			}
		}
	}
	return wn;
}

function rasterizeFill(
	contours: Point2D[][],
	width: number,
	height: number,
): Uint8Array {
	const grid = new Uint8Array(width * height);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (windingNumber(x + 0.5, y + 0.5, contours) !== 0) {
				grid[y * width + x] = 1;
			}
		}
	}

	return grid;
}

export function rasterizeGlyphs(
	path: opentype.Path,
	resolution: number,
): RasterResult {
	const contours = flattenPath(path.commands);
	if (contours.length === 0) {
		return { grid: new Uint8Array(0), width: 0, height: 0 };
	}

	const { minX, minY, maxX, maxY } = contourBounds(contours);
	const pathWidth = maxX - minX;
	const pathHeight = maxY - minY;
	if (pathWidth <= 0 || pathHeight <= 0) {
		return { grid: new Uint8Array(0), width: 0, height: 0 };
	}

	const scale = resolution / pathHeight;
	const gridW = Math.ceil(pathWidth * scale);
	const gridH = resolution;

	const scaled: Point2D[][] = contours.map((contour) =>
		contour.map((p) => ({
			x: (p.x - minX) * scale,
			y: (p.y - minY) * scale,
		})),
	);

	const grid = rasterizeFill(scaled, gridW, gridH);

	return { grid, width: gridW, height: gridH };
}

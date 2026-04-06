import type opentype from "opentype.js";

export interface Point2D {
	x: number;
	y: number;
}

export interface Point3D {
	x: number;
	y: number;
	z: number;
}

export interface Face3D {
	vertices: Point3D[];
	type: "front" | "back" | "side";
	normal: Point3D;
}

export interface ProjectedFace {
	points: Point2D[];
	depth: number;
	type: "front" | "back" | "side";
}

export function flattenPath(
	commands: opentype.PathCommand[],
	segments = 8,
): Point2D[][] {
	const contours: Point2D[][] = [];
	let current: Point2D[] = [];
	let cx = 0;
	let cy = 0;

	for (const cmd of commands) {
		if (cmd.type === "M") {
			if (current.length > 0) contours.push(current);
			current = [{ x: cmd.x, y: cmd.y }];
			cx = cmd.x;
			cy = cmd.y;
		} else if (cmd.type === "L") {
			current.push({ x: cmd.x, y: cmd.y });
			cx = cmd.x;
			cy = cmd.y;
		} else if (cmd.type === "Q") {
			for (let i = 1; i <= segments; i++) {
				const t = i / segments;
				const mt = 1 - t;
				current.push({
					x: mt * mt * cx + 2 * mt * t * cmd.x1 + t * t * cmd.x,
					y: mt * mt * cy + 2 * mt * t * cmd.y1 + t * t * cmd.y,
				});
			}
			cx = cmd.x;
			cy = cmd.y;
		} else if (cmd.type === "C") {
			for (let i = 1; i <= segments; i++) {
				const t = i / segments;
				const mt = 1 - t;
				current.push({
					x:
						mt * mt * mt * cx +
						3 * mt * mt * t * cmd.x1 +
						3 * mt * t * t * cmd.x2 +
						t * t * t * cmd.x,
					y:
						mt * mt * mt * cy +
						3 * mt * mt * t * cmd.y1 +
						3 * mt * t * t * cmd.y2 +
						t * t * t * cmd.y,
				});
			}
			cx = cmd.x;
			cy = cmd.y;
		} else if (cmd.type === "Z") {
			if (current.length > 0) contours.push(current);
			current = [];
		}
	}
	if (current.length > 0) contours.push(current);
	return contours;
}

export function contourBounds(contours: Point2D[][]): {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
} {
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const contour of contours) {
		for (const p of contour) {
			if (p.x < minX) minX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.x > maxX) maxX = p.x;
			if (p.y > maxY) maxY = p.y;
		}
	}

	return { minX, minY, maxX, maxY };
}

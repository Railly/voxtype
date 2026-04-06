import type opentype from "opentype.js";
import { contourBounds, flattenPath, type Point2D } from "./geometry.ts";
import type { ProjectionConfig } from "./scene.ts";
import type { Theme } from "./themes.ts";

function getExtrudeOffset(
	depth: number,
	projection: ProjectionConfig,
): Point2D {
	if (projection.type === "isometric") {
		const rad = ((projection.angle + 90) * Math.PI) / 180;
		const factor = depth * 0.5;
		return { x: Math.cos(rad) * factor, y: Math.sin(rad) * factor };
	}
	if (projection.type === "oblique") {
		const rad = (((projection.angle ?? 45) + 180) * Math.PI) / 180;
		const factor = depth * 0.4;
		return { x: Math.cos(rad) * factor, y: Math.sin(rad) * factor };
	}
	return { x: depth * 0.3, y: depth * 0.3 };
}

function contourToSubpath(points: Point2D[]): string {
	if (points.length === 0) return "";
	let s = `M${points[0]!.x.toFixed(2)},${points[0]!.y.toFixed(2)}`;
	for (let i = 1; i < points.length; i++) {
		s += ` L${points[i]!.x.toFixed(2)},${points[i]!.y.toFixed(2)}`;
	}
	return `${s} Z`;
}

export function renderExtruded(
	path: opentype.Path,
	depth: number,
	scale: number,
	theme: Theme,
	projection: ProjectionConfig,
): string {
	const contours = flattenPath(path.commands, 12);
	if (contours.length === 0) return "<svg></svg>";

	const bounds = contourBounds(contours);
	const scaled = contours.map((c) =>
		c.map((p) => ({
			x: (p.x - bounds.minX) * scale,
			y: (p.y - bounds.minY) * scale,
		})),
	);

	const offset = getExtrudeOffset(depth * scale, projection);

	const svgParts: string[] = [];

	const backContours = scaled.map((c) =>
		c.map((p) => ({ x: p.x + offset.x, y: p.y + offset.y })),
	);
	const backPath = backContours.map(contourToSubpath).join(" ");
	svgParts.push(
		`<path d="${backPath}" fill="${theme.side}" fill-rule="evenodd" stroke="${theme.stroke}" stroke-width="${theme.strokeWidth}" stroke-linejoin="round"/>`,
	);

	for (const contour of scaled) {
		const len = contour.length;
		for (let i = 0; i < len; i++) {
			const j = (i + 1) % len;
			const p1 = contour[i]!;
			const p2 = contour[j]!;

			const edgeDx = p2.x - p1.x;
			const edgeDy = p2.y - p1.y;
			const mag = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
			if (mag < 0.01) continue;

			const nx = edgeDy / mag;
			const ny = -edgeDx / mag;
			const facing = nx * offset.x + ny * offset.y;
			if (facing >= 0) continue;

			const brightness =
				Math.abs(facing) / Math.sqrt(offset.x * offset.x + offset.y * offset.y);
			const fill = brightness > 0.5 ? theme.front : theme.side;

			const quad = [
				p1,
				p2,
				{ x: p2.x + offset.x, y: p2.y + offset.y },
				{ x: p1.x + offset.x, y: p1.y + offset.y },
			];
			svgParts.push(
				`<path d="${contourToSubpath(quad)}" fill="${fill}" stroke="${theme.stroke}" stroke-width="${theme.strokeWidth}" stroke-linejoin="round"/>`,
			);
		}
	}

	const frontPath = scaled.map(contourToSubpath).join(" ");
	svgParts.push(
		`<path d="${frontPath}" fill="${theme.top}" fill-rule="evenodd" stroke="${theme.stroke}" stroke-width="${theme.strokeWidth}" stroke-linejoin="round"/>`,
	);

	const allPoints = [
		...scaled.flat(),
		...scaled.flat().map((p) => ({ x: p.x + offset.x, y: p.y + offset.y })),
	];
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	for (const p of allPoints) {
		if (p.x < minX) minX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.x > maxX) maxX = p.x;
		if (p.y > maxY) maxY = p.y;
	}

	const pad = 10;
	const vb = `${(minX - pad).toFixed(2)} ${(minY - pad).toFixed(2)} ${(maxX - minX + pad * 2).toFixed(2)} ${(maxY - minY + pad * 2).toFixed(2)}`;
	const bg = theme.background ? `;background:${theme.background}` : "";

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" style="width:100%;height:100%${bg}">\n${svgParts.join("\n")}\n</svg>`;
}

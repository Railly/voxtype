export interface Theme {
	name: string;
	top: string;
	front: string;
	side: string;
	stroke: string;
	strokeWidth: number;
	background?: string;
}

export const themes: Record<string, Theme> = {
	default: {
		name: "Default",
		top: "#93c5fd",
		front: "#60a5fa",
		side: "#3b82f6",
		stroke: "#1e3a5f",
		strokeWidth: 0.5,
	},
	catppuccin: {
		name: "Catppuccin Mocha",
		top: "#cba6f7",
		front: "#b4befe",
		side: "#89b4fa",
		stroke: "#313244",
		strokeWidth: 0.5,
		background: "#1e1e2e",
	},
	"one-hunter": {
		name: "One Hunter",
		top: "#e06c75",
		front: "#c678dd",
		side: "#61afef",
		stroke: "#282c34",
		strokeWidth: 0.5,
		background: "#21252b",
	},
	dracula: {
		name: "Dracula",
		top: "#ff79c6",
		front: "#bd93f9",
		side: "#8be9fd",
		stroke: "#282a36",
		strokeWidth: 0.5,
		background: "#282a36",
	},
	mono: {
		name: "Monochrome",
		top: "#e5e5e5",
		front: "#a3a3a3",
		side: "#737373",
		stroke: "#262626",
		strokeWidth: 0.5,
	},
	"mono-dark": {
		name: "Monochrome Dark",
		top: "#525252",
		front: "#404040",
		side: "#262626",
		stroke: "#a3a3a3",
		strokeWidth: 0.5,
		background: "#0a0a0a",
	},
	emerald: {
		name: "Emerald",
		top: "#6ee7b7",
		front: "#34d399",
		side: "#10b981",
		stroke: "#064e3b",
		strokeWidth: 0.5,
	},
	sunset: {
		name: "Sunset",
		top: "#fbbf24",
		front: "#f59e0b",
		side: "#ef4444",
		stroke: "#7c2d12",
		strokeWidth: 0.5,
		background: "#1c1917",
	},
};

export function resolveTheme(name: string, plotter: boolean): Theme {
	const theme = themes[name];
	if (!theme) {
		const available = Object.keys(themes).join(", ");
		throw new Error(`Unknown theme "${name}". Available: ${available}`);
	}
	if (plotter) {
		return {
			...theme,
			top: "none",
			front: "none",
			side: "none",
			stroke: "#000000",
			strokeWidth: 0.8,
			background: "#ffffff",
		};
	}
	return theme;
}

export function themeToHeerichStyle(theme: Theme) {
	return {
		default: {
			fill: theme.side,
			stroke: theme.stroke,
			strokeWidth: theme.strokeWidth,
		},
		top: { fill: theme.top },
		front: { fill: theme.front },
		right: { fill: theme.side },
		left: { fill: theme.side },
	};
}

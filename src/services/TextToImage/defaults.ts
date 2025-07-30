import path from "path";

export type FontConfig = {
    path: string;
    family: string;
    weight: string;
}

const DEFAULT_OPTIONS = {
    fillStyle: "#ffffff",
    strokeStyle: "#000000",
    lineWidth: 12,
    textAlign: "center",
    textBaseline: "middle",
    canvasWidth: 1000,
    canvasHeight: 1000,
    padding: 20,
    rtlFont: {
        path: path.join(process.cwd(), "assets", "fonts", "font.ttf"),
        family: "CustomFont",
        weight: "normal"
    },
    ltrFont: {
        path: path.join(process.cwd(), "assets", "fonts", "OpenSans-Bold.ttf"),
        family: "Open Sans",
        weight: "bold"
    },
} as const

type TextToImageOptions = {
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    canvasWidth?: number;
    canvasHeight?: number;
    padding?: number;
    rtlFont?: FontConfig;
    ltrFont?: FontConfig;
}

export { TextToImageOptions, DEFAULT_OPTIONS };

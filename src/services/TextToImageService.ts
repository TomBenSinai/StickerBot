import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
import path from "path";
import { ITextToImageService } from "../types/BotConfig";

export class TextToImageService implements ITextToImageService {
  private fontRegistered: boolean = false;

  constructor(private fontPath?: string) {
    this.initializeFont();
  }

  private initializeFont(): void {
    try {
      const fontFilePath = this.fontPath || path.join(process.cwd(), "assets", "fonts", "font.ttf");
      registerFont(fontFilePath, { family: "CustomFont" });
      this.fontRegistered = true;
    } catch (err) {
      console.warn("Could not register custom font, using system fonts");
      this.fontRegistered = false;
    }
  }

  async generateImage(text: string): Promise<string> {
    try {
      const canvas = createCanvas(1000, 1000);
      const ctx = canvas.getContext("2d");

      // Set background to transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Configure text styling
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Use custom font if available, fallback to system fonts
      const fontSize = Math.min(300, Math.max(120, 800 / text.length));
      ctx.font = `${fontSize}px ${this.fontRegistered ? 'CustomFont,' : ''} Arial, sans-serif`;

      // Split text into lines if too long
      const maxWidth = canvas.width - 30;
      const lines = this.wrapText(ctx, text, maxWidth);
      
      // Calculate starting Y position for centered text
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      let y = (canvas.height - totalHeight) / 2 + lineHeight / 2;

      // Draw each line
      lines.forEach((line) => {
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
        y += lineHeight;
      });

      // Convert to base64
      const buffer = canvas.toBuffer("image/png");
      return buffer.toString("base64");

    } catch (err) {
      throw new Error("Something went wrong while creating the image");
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
} 

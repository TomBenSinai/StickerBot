import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
import path from "path";
import { direction } from "direction";
import { ITextToImageService } from "../types/BotConfig";

export class TextToImageService implements ITextToImageService {
  private fontRegistered: boolean = false;
  private readonly canvasSize = 1000;
  private readonly padding = 20;

  constructor(private fontPath?: string) {
    this.initializeFonts();
  }

  private initializeFonts(): void {
    try {
      const openSansRegular = path.join(process.cwd(), "assets", "fonts", "OpenSans-Regular.ttf");
      const openSansBold = path.join(process.cwd(), "assets", "fonts", "OpenSans-Bold.ttf");
      registerFont(openSansRegular, { family: "Open Sans", weight: "normal" });
      registerFont(openSansBold, { family: "Open Sans", weight: "bold" });

      if (this.fontPath) {
        const fontFilePath = this.fontPath;
        registerFont(fontFilePath, { family: "CustomFont" });
      } else {
        const defaultRtlFont = path.join(process.cwd(), "assets", "fonts", "font.ttf");
        registerFont(defaultRtlFont, { family: "CustomFont" });
      }
    
      this.fontRegistered = true;
    } catch (err) {
      console.warn("Could not register fonts, using system fonts");
      this.fontRegistered = false;
    }
  }

  async generateImage(text: string): Promise<string> {
    try {
      const canvas = createCanvas(this.canvasSize, this.canvasSize);
      const ctx = canvas.getContext("2d");

      const textDirection = direction(text);
      ctx.direction = textDirection === 'rtl' ? 'rtl' : 'ltr';

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 12;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const layout = this.findOptimalLayout(ctx, text, textDirection);
      
      const fontFamily = this.getFontFamily(textDirection);
      const fontWeight = this.getFontWeight(textDirection);
      ctx.font = `${fontWeight} ${layout.fontSize}px ${fontFamily}`;

      layout.lines.forEach((line, index) => {
        const y = layout.startY + (index * layout.lineHeight);
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
      });

      const buffer = canvas.toBuffer("image/png");
      return buffer.toString("base64");

    } catch (err) {
      throw new Error("Something went wrong while creating the image");
    }
  }

  private getFontFamily(textDirection: string): string {
    if (!this.fontRegistered) {
      return 'Arial, sans-serif';
    }

    if (textDirection === 'rtl') {
      return 'CustomFont, Arial, sans-serif';
    } else {
      return '"Open Sans", Arial, sans-serif';
    }
  }

  private getFontWeight(textDirection: string): string {
    if (textDirection === 'rtl') {
      return 'normal';
    } else {
      return 'bold';
    }
  }

  private findOptimalLayout(ctx: CanvasRenderingContext2D, text: string, textDirection: string): {
    lines: string[];
    fontSize: number;
    lineHeight: number;
    startY: number;
  } {
    const maxWidth = this.canvasSize - (this.padding * 2);
    const maxHeight = this.canvasSize - (this.padding * 2);
    const fontFamily = this.getFontFamily(textDirection);
    const fontWeight = this.getFontWeight(textDirection);
    
    for (let fontSize = 500; fontSize >= 20; fontSize -= 5) {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      
      const lines = this.wrapText(ctx, text, maxWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      
      const allLinesFitWidth = lines.every(line => ctx.measureText(line).width <= maxWidth);
      
      if (totalHeight <= maxHeight && allLinesFitWidth) {
        return {
          lines,
          fontSize,
          lineHeight,
          startY: (this.canvasSize - totalHeight) / 2 + lineHeight / 2
        };
      }
    }

    let finalFontSize = 10; // Default minimum if nothing fits
    for (let testSize = 20; testSize >= 10; testSize -= 1) {
      ctx.font = `${fontWeight} ${testSize}px ${fontFamily}`;
      const lines = this.wrapText(ctx, text, maxWidth);
      const allLinesFitWidth = lines.every(line => ctx.measureText(line).width <= maxWidth);
      
      if (allLinesFitWidth) {
        finalFontSize = testSize;
        break;
      }
    }
    
    ctx.font = `${fontWeight} ${finalFontSize}px ${fontFamily}`;
    const lines = this.wrapText(ctx, text, maxWidth);
    const lineHeight = finalFontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    
    return {
      lines,
      fontSize: finalFontSize,
      lineHeight,
      startY: (this.canvasSize - totalHeight) / 2 + lineHeight / 2
    };
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (ctx.measureText(text).width <= maxWidth) {
      return [text];
    }

    // Split into words and wrap
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  }


} 

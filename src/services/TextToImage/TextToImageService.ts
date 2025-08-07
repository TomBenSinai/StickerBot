import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
import path from "path";
import fs from "fs";
import { direction } from "direction";
import { ITextToImageService } from "../../types/BotConfig";
import { DEFAULT_OPTIONS, TextToImageOptions, FontConfig } from "./defaults";

export class TextToImageService implements ITextToImageService {
  private fontRegistered: boolean = false;
  private fillStyle: string;
  private strokeStyle: string;
  private lineWidth: number;
  private textAlign: CanvasTextAlign;
  private textBaseline: CanvasTextBaseline;
  private canvasWidth: number;
  private canvasHeight: number;
  private padding: number;
  private rtlFont: FontConfig;
  private ltrFont: FontConfig;

  constructor(options: TextToImageOptions = DEFAULT_OPTIONS) {
    this.fillStyle = options.fillStyle ?? DEFAULT_OPTIONS.fillStyle;
    this.strokeStyle = options.strokeStyle ?? DEFAULT_OPTIONS.strokeStyle;
    this.lineWidth = options.lineWidth ?? DEFAULT_OPTIONS.lineWidth;
    this.textAlign = options.textAlign ?? DEFAULT_OPTIONS.textAlign;
    this.textBaseline = options.textBaseline ?? DEFAULT_OPTIONS.textBaseline;
    this.canvasWidth = options.canvasWidth ?? DEFAULT_OPTIONS.canvasWidth;
    this.canvasHeight = options.canvasHeight ?? DEFAULT_OPTIONS.canvasHeight;
    this.padding = options.padding ?? DEFAULT_OPTIONS.padding;
    this.rtlFont = options.rtlFont ?? DEFAULT_OPTIONS.rtlFont;
    this.ltrFont = options.ltrFont ?? DEFAULT_OPTIONS.ltrFont;
    this.initializeFont();
  }

  private initializeFont(): void {
    try {
      registerFont(this.rtlFont.path, {
        family: this.rtlFont.family,
        weight: this.rtlFont.weight as any
      });

      registerFont(this.ltrFont.path, {
        family: this.ltrFont.family,
        weight: this.ltrFont.weight as any
      });

      this.fontRegistered = true;
    } catch (err) {
      console.warn("Could not register custom fonts, using system fonts");
      this.fontRegistered = false;
    }

    const emojiFontPath = path.resolve(__dirname, "../../../assets/fonts/NotoColorEmoji.ttf");
    if (fs.existsSync(emojiFontPath)) {
      try {
        registerFont(emojiFontPath, {
          family: "Noto Color Emoji",
          weight: "normal" as any
        });
      } catch (err) {
        console.warn("Failed to register emoji font");
      }
    } else {
      console.warn("Emoji font not found; emojis may render as hex codes");
    }
  }

  async generateImage(text: string): Promise<string> {
    try {
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
      const ctx = canvas.getContext("2d");

      // Detect text direction
      const textDirection = direction(text);
      ctx.direction = textDirection === 'rtl' ? 'rtl' : 'ltr';

      // Set background to transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = this.fillStyle;
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.textAlign = this.textAlign;
      ctx.textBaseline = this.textBaseline;

      // Find optimal font size that fills the height first
      const maxWidth = canvas.width - this.padding * 2;
      const maxHeight = canvas.height - this.padding * 2;
      
      let bestFontSize = 20;
      let bestLines: string[] = [];
      
      for (let fontSize = 500; fontSize >= 20; fontSize -= 5) {
        const fontFamily = this.getFontFamily(textDirection);
        const fontWeight = this.getFontWeight(textDirection);
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        const lines = this.wrapText(ctx, text, maxWidth);
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        
        const allLinesFitWidth = lines.every(line => ctx.measureText(line).width <= maxWidth);
        
        if (totalHeight <= maxHeight && allLinesFitWidth) {
          bestFontSize = fontSize;
          bestLines = lines;
          break;
        }
      }
      
      // Fallback: if no size worked, try smaller sizes to ensure no overflow
      if (bestLines.length === 0) {
        for (let fontSize = 19; fontSize >= 10; fontSize -= 1) {
          const fontFamily = this.getFontFamily(textDirection);
          const fontWeight = this.getFontWeight(textDirection);
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          
          const lines = this.wrapText(ctx, text, maxWidth);
          const lineHeight = fontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          const allLinesFitWidth = lines.every(line => ctx.measureText(line).width <= maxWidth);
          
          if (totalHeight <= maxHeight && allLinesFitWidth) {
            bestFontSize = fontSize;
            bestLines = lines;
            break;
          }
        }
      }
      
      // Final fallback: use minimum size if nothing else worked
      if (bestLines.length === 0) {
        bestFontSize = 10;
        const fontFamily = this.getFontFamily(textDirection);
        const fontWeight = this.getFontWeight(textDirection);
        ctx.font = `${fontWeight} ${bestFontSize}px ${fontFamily}`;
        bestLines = this.wrapText(ctx, text, maxWidth);
      }
      
      // Set the final font and calculate positioning
      const fontFamily = this.getFontFamily(textDirection);
      const fontWeight = this.getFontWeight(textDirection);
      ctx.font = `${fontWeight} ${bestFontSize}px ${fontFamily}`;
      const lineHeight = bestFontSize * 1.2;
      const totalHeight = bestLines.length * lineHeight;
      let y = (canvas.height - totalHeight) / 2 + lineHeight / 2;

      // Draw each line
      bestLines.forEach((line) => {
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

  private getFontFamily(textDirection: string): string {
    const emojiFallback = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"';

    if (!this.fontRegistered) {
      return `${emojiFallback}, Arial, sans-serif`;
    }

    if (textDirection === 'rtl') {
      return `"${this.rtlFont.family}", ${emojiFallback}, Arial, sans-serif`;
    } else {
      return `"${this.ltrFont.family}", ${emojiFallback}, Arial, sans-serif`;
    }
  }

  private getFontWeight(textDirection: string): string {
    if (textDirection === 'rtl') {
      return this.rtlFont.weight;
    } else {
      return this.ltrFont.weight;
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (ctx.measureText(text).width <= maxWidth) {
      return [text];
    }

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        // If current line has content, push it and start new line with current word
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, put it on its own line anyway
          lines.push(word);
          currentLine = '';
        }
      }
    }

    // Add the last line if it has content
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  }
} 

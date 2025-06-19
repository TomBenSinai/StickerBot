import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
import path from "path";

// Register custom font if available
try {
  const fontPath = path.join(process.cwd(), "assets", "fonts", "font.ttf");
  registerFont(fontPath, { family: "CustomFont" });
} catch (err) {
  // Silently fall back to system fonts if custom font fails to load
  console.warn("Could not register custom font, using system fonts");
}

async function textToImage(text: string): Promise<string> {
  try {
    // Create canvas with reasonable dimensions
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

    // Try to use custom font, fallback to system fonts
    const fontSize = Math.min(300, Math.max(120, 800 / text.length));
    ctx.font = `${fontSize}px CustomFont, Arial, sans-serif`;

    // Split text into lines if too long
    const maxWidth = canvas.width - 30; // Leave some margin
    const lines = wrapText(ctx, text, maxWidth);
    
    // Calculate starting Y position for centered text
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let y = (canvas.height - totalHeight) / 2 + lineHeight / 2;

    // Draw each line
    lines.forEach((line) => {
      // Draw stroke (outline)
      ctx.strokeText(line, canvas.width / 2, y);
      // Draw fill (main text)
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

export default textToImage;

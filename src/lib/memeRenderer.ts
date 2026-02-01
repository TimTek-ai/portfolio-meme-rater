// Text wrapping utility
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Draw text with outline
function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number
) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = fontSize / 8;
  ctx.lineJoin = "round";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);
}

export interface RenderOptions {
  topText: string;
  bottomText: string;
}

export async function renderMemeToCanvas(
  imageUrl: string,
  options: RenderOptions
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Calculate font size based on image width
      const baseFontSize = Math.floor(img.width / 10);
      const maxWidth = img.width * 0.9;
      const padding = img.width * 0.05;

      ctx.font = `bold ${baseFontSize}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";

      // Draw top text
      if (options.topText) {
        const topLines = wrapText(ctx, options.topText.toUpperCase(), maxWidth);
        let topY = baseFontSize + padding;

        for (const line of topLines) {
          drawOutlinedText(ctx, line, img.width / 2, topY, baseFontSize);
          topY += baseFontSize * 1.1;
        }
      }

      // Draw bottom text
      if (options.bottomText) {
        const bottomLines = wrapText(ctx, options.bottomText.toUpperCase(), maxWidth);
        let bottomY = img.height - padding - (bottomLines.length - 1) * baseFontSize * 1.1;

        for (const line of bottomLines) {
          drawOutlinedText(ctx, line, img.width / 2, bottomY, baseFontSize);
          bottomY += baseFontSize * 1.1;
        }
      }

      resolve(canvas);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

export async function renderMemeToBlob(
  imageUrl: string,
  options: RenderOptions
): Promise<Blob> {
  const canvas = await renderMemeToCanvas(imageUrl, options);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob"));
      }
    }, "image/png");
  });
}

export async function downloadMeme(
  imageUrl: string,
  options: RenderOptions,
  filename: string = "meme.png"
): Promise<void> {
  const canvas = await renderMemeToCanvas(imageUrl, options);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

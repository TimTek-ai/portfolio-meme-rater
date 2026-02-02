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
  watermark?: string;
  format?: "standard" | "tiktok";
  portfolioStats?: {
    percentageReturn: number;
    ticker?: string;
  };
}

const DEFAULT_WATERMARK = "portfoliomemer.app";

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

      // Draw watermark
      const watermarkText = options.watermark ?? DEFAULT_WATERMARK;
      const watermarkFontSize = Math.floor(img.width / 30);
      ctx.font = `${watermarkFontSize}px Arial, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(watermarkText, img.width - 10, img.height - 10);
      // Add subtle shadow for visibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillText(watermarkText, img.width - 11, img.height - 9);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(watermarkText, img.width - 10, img.height - 10);

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
  const renderFn = options.format === "tiktok" ? renderTikTokMemeToCanvas : renderMemeToCanvas;
  const canvas = await renderFn(imageUrl, options);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// TikTok vertical format (9:16 aspect ratio)
export async function renderTikTokMemeToCanvas(
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
      // TikTok dimensions (1080x1920)
      const TIKTOK_WIDTH = 1080;
      const TIKTOK_HEIGHT = 1920;

      canvas.width = TIKTOK_WIDTH;
      canvas.height = TIKTOK_HEIGHT;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, TIKTOK_HEIGHT);
      if (options.portfolioStats && options.portfolioStats.percentageReturn >= 0) {
        gradient.addColorStop(0, "#064e3b");
        gradient.addColorStop(1, "#022c22");
      } else {
        gradient.addColorStop(0, "#7f1d1d");
        gradient.addColorStop(1, "#450a0a");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, TIKTOK_WIDTH, TIKTOK_HEIGHT);

      // Draw meme image in center (scaled to fit width with padding)
      const imgPadding = 60;
      const maxImgWidth = TIKTOK_WIDTH - imgPadding * 2;
      const scale = maxImgWidth / img.width;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const imgX = (TIKTOK_WIDTH - scaledWidth) / 2;
      const imgY = (TIKTOK_HEIGHT - scaledHeight) / 2;

      // Add shadow to image
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
      ctx.shadowColor = "transparent";

      // Draw stats at top
      if (options.portfolioStats) {
        const stats = options.portfolioStats;
        const isGain = stats.percentageReturn >= 0;

        // Ticker/Portfolio label
        ctx.font = "bold 48px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(stats.ticker || "MY PORTFOLIO", TIKTOK_WIDTH / 2, 120);

        // Big percentage
        ctx.font = "bold 140px Arial, sans-serif";
        ctx.fillStyle = isGain ? "#4ade80" : "#f87171";
        const percentText = `${isGain ? "+" : ""}${stats.percentageReturn.toFixed(1)}%`;
        ctx.fillText(percentText, TIKTOK_WIDTH / 2, 260);

        // Emoji row
        ctx.font = "80px Arial, sans-serif";
        const emojis = isGain
          ? (stats.percentageReturn > 50 ? "🚀🚀🚀" : "📈💰✨")
          : (stats.percentageReturn < -30 ? "💀📉🔥" : "😬📉💸");
        ctx.fillText(emojis, TIKTOK_WIDTH / 2, 360);
      }

      // Draw top text on the meme
      const baseFontSize = Math.floor(scaledWidth / 10);
      ctx.font = `bold ${baseFontSize}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";

      if (options.topText) {
        const topLines = wrapText(ctx, options.topText.toUpperCase(), scaledWidth * 0.9);
        let topY = imgY + baseFontSize + 20;
        for (const line of topLines) {
          drawOutlinedText(ctx, line, TIKTOK_WIDTH / 2, topY, baseFontSize);
          topY += baseFontSize * 1.1;
        }
      }

      if (options.bottomText) {
        const bottomLines = wrapText(ctx, options.bottomText.toUpperCase(), scaledWidth * 0.9);
        let bottomY = imgY + scaledHeight - 20 - (bottomLines.length - 1) * baseFontSize * 1.1;
        for (const line of bottomLines) {
          drawOutlinedText(ctx, line, TIKTOK_WIDTH / 2, bottomY, baseFontSize);
          bottomY += baseFontSize * 1.1;
        }
      }

      // Draw CTA at bottom
      ctx.font = "bold 36px Arial, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("Make your own at", TIKTOK_WIDTH / 2, TIKTOK_HEIGHT - 140);

      ctx.font = "bold 48px Arial, sans-serif";
      ctx.fillStyle = "#60a5fa";
      ctx.fillText(options.watermark ?? DEFAULT_WATERMARK, TIKTOK_WIDTH / 2, TIKTOK_HEIGHT - 80);

      resolve(canvas);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

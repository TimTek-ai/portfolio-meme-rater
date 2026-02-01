"use client";

import { useState, useCallback } from "react";
import { selectMemeTemplate, formatMemeText, getMemeImageUrl } from "@/lib/imgflip";
import { renderMemeToCanvas } from "@/lib/memeRenderer";
import type { HoldingSummary, PortfolioSummary } from "@/types/portfolio";

interface MemeGalleryProps {
  summary: PortfolioSummary;
}

interface MemeData {
  ticker: string;
  percentageGain: number;
  topText: string;
  bottomText: string;
  imageUrl: string;
}

export function MemeGallery({ summary }: MemeGalleryProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generate meme data for all holdings
  const generateMemeData = useCallback((): MemeData[] => {
    const memes: MemeData[] = [];

    // Portfolio overall meme
    const portfolioTemplate = selectMemeTemplate(summary.percentageReturn);
    memes.push({
      ticker: "Portfolio",
      percentageGain: summary.percentageReturn,
      topText: formatMemeText(portfolioTemplate.topText, summary.percentageReturn),
      bottomText: formatMemeText(portfolioTemplate.bottomText, summary.percentageReturn),
      imageUrl: getMemeImageUrl(portfolioTemplate),
    });

    // Individual holding memes
    for (const holding of summary.holdings) {
      const template = selectMemeTemplate(holding.percentageGain);
      memes.push({
        ticker: holding.ticker,
        percentageGain: holding.percentageGain,
        topText: formatMemeText(template.topText, holding.percentageGain, holding.ticker),
        bottomText: formatMemeText(template.bottomText, holding.percentageGain, holding.ticker),
        imageUrl: getMemeImageUrl(template),
      });
    }

    return memes;
  }, [summary]);

  const downloadAllMemes = useCallback(async () => {
    setGenerating(true);
    setProgress(0);

    const memes = generateMemeData();
    const zip = await import("jszip").then((m) => new m.default());

    for (let i = 0; i < memes.length; i++) {
      const meme = memes[i];
      try {
        const canvas = await renderMemeToCanvas(meme.imageUrl, {
          topText: meme.topText,
          bottomText: meme.bottomText,
        });

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });

        zip.file(`${meme.ticker}-meme.png`, blob);
      } catch (error) {
        console.error(`Failed to render ${meme.ticker} meme:`, error);
      }

      setProgress(((i + 1) / memes.length) * 100);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "portfolio-memes.zip";
    link.click();

    setGenerating(false);
  }, [generateMemeData]);

  const downloadAsGrid = useCallback(async () => {
    setGenerating(true);
    setProgress(0);

    const memes = generateMemeData();
    const cols = Math.min(3, memes.length);
    const rows = Math.ceil(memes.length / cols);
    const cellSize = 400;
    const padding = 20;

    const canvas = document.createElement("canvas");
    canvas.width = cols * (cellSize + padding) + padding;
    canvas.height = rows * (cellSize + padding) + padding;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < memes.length; i++) {
      const meme = memes[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (cellSize + padding);
      const y = padding + row * (cellSize + padding);

      try {
        const memeCanvas = await renderMemeToCanvas(meme.imageUrl, {
          topText: meme.topText,
          bottomText: meme.bottomText,
        });

        ctx.drawImage(memeCanvas, x, y, cellSize, cellSize);

        // Add ticker label
        ctx.fillStyle = "white";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `${meme.ticker}: ${meme.percentageGain >= 0 ? "+" : ""}${meme.percentageGain.toFixed(1)}%`,
          x + cellSize / 2,
          y + cellSize + 16
        );
      } catch (error) {
        console.error(`Failed to render ${meme.ticker}:`, error);
      }

      setProgress(((i + 1) / memes.length) * 100);
    }

    const link = document.createElement("a");
    link.download = "portfolio-memes-grid.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    setGenerating(false);
  }, [generateMemeData]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="font-bold">Export All Memes</h3>
      <p className="text-sm text-gray-400">
        Generate and download memes for your entire portfolio
      </p>

      {generating ? (
        <div className="space-y-2">
          <div className="h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-400">
            Generating... {Math.round(progress)}%
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={downloadAllMemes}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
          >
            Download ZIP
          </button>
          <button
            onClick={downloadAsGrid}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
          >
            Download Grid Image
          </button>
        </div>
      )}
    </div>
  );
}

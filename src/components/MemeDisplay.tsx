"use client";

import { useState, useRef, useCallback } from "react";
import { selectMemeTemplate, formatMemeText, getMemeImageUrl } from "@/lib/imgflip";

interface MemeDisplayProps {
  percentageReturn: number;
  ticker?: string;
}

export function MemeDisplay({ percentageReturn, ticker }: MemeDisplayProps) {
  const [generated, setGenerated] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState(() => selectMemeTemplate(percentageReturn));
  const memeRef = useRef<HTMLDivElement>(null);

  const topText = formatMemeText(template.topText, percentageReturn, ticker);
  const bottomText = formatMemeText(template.bottomText, percentageReturn, ticker);
  const imageUrl = getMemeImageUrl(template);

  const handleGenerate = () => {
    setTemplate(selectMemeTemplate(percentageReturn));
    setGenerated(true);
    setImageLoaded(false);
    setError(null);
  };

  const handleDownload = useCallback(async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.floor(img.width / 12);
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 15;

      const topY = fontSize + 10;
      ctx.strokeText(topText.toUpperCase(), img.width / 2, topY);
      ctx.fillText(topText.toUpperCase(), img.width / 2, topY);

      const bottomY = img.height - 20;
      ctx.strokeText(bottomText.toUpperCase(), img.width / 2, bottomY);
      ctx.fillText(bottomText.toUpperCase(), img.width / 2, bottomY);

      const link = document.createElement("a");
      link.download = "portfolio-meme.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = imageUrl;
  }, [imageUrl, topText, bottomText]);

  const handleShare = useCallback(async (platform: "twitter" | "copy") => {
    const displayTicker = ticker || "my portfolio";
    const isPositive = percentageReturn >= 0;
    const text = `${displayTicker}: ${isPositive ? "+" : ""}${percentageReturn.toFixed(1)}% - Check out my portfolio meme!`;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  }, [percentageReturn, ticker]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold">Overall Portfolio Meme</h2>
      <p className="text-sm text-gray-400">Template: {template.name}</p>

      {!generated ? (
        <button
          onClick={handleGenerate}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Generate Meme
        </button>
      ) : (
        <div className="space-y-4">
          <div
            ref={memeRef}
            className="relative w-full max-w-md mx-auto bg-black rounded overflow-hidden"
          >
            {!imageLoaded && !error && (
              <div className="aspect-square flex items-center justify-center text-gray-400">
                Loading...
              </div>
            )}
            {error && (
              <div className="aspect-square flex items-center justify-center text-red-400">
                {error}
              </div>
            )}
            <img
              src={imageUrl}
              alt="Meme template"
              className={`w-full ${imageLoaded ? "block" : "hidden"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setError("Failed to load meme image")}
            />
            {imageLoaded && (
              <>
                <div className="absolute top-2 left-0 right-0 text-center px-2">
                  <span
                    className="text-white font-bold uppercase"
                    style={{
                      fontSize: "clamp(14px, 5vw, 28px)",
                      textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000",
                      fontFamily: "Impact, sans-serif",
                    }}
                  >
                    {topText}
                  </span>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center px-2">
                  <span
                    className="text-white font-bold uppercase"
                    style={{
                      fontSize: "clamp(14px, 5vw, 28px)",
                      textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000",
                      fontFamily: "Impact, sans-serif",
                    }}
                  >
                    {bottomText}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              New Meme
            </button>
            <button
              onClick={handleDownload}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
            >
              Download
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleShare("twitter")}
              className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors"
            >
              Share on Twitter
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

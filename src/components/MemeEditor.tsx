"use client";

import { useState, useEffect, useCallback } from "react";
import { selectMemeTemplate, formatMemeText, getMemeImageUrl, memeTemplates } from "@/lib/imgflip";
import { downloadMeme } from "@/lib/memeRenderer";
import type { MemeTemplate } from "@/types/portfolio";

interface MemeEditorProps {
  percentageReturn: number;
  ticker?: string;
  onShare?: (text: string) => void;
}

export function MemeEditor({ percentageReturn, ticker }: MemeEditorProps) {
  const [template, setTemplate] = useState<MemeTemplate>(() => selectMemeTemplate(percentageReturn));
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const imageUrl = getMemeImageUrl(template);

  // Update text when template changes
  useEffect(() => {
    setTopText(formatMemeText(template.topText, percentageReturn, ticker));
    setBottomText(formatMemeText(template.bottomText, percentageReturn, ticker));
  }, [template, percentageReturn, ticker]);

  const handleRandomTemplate = () => {
    setTemplate(selectMemeTemplate(percentageReturn));
    setImageLoaded(false);
  };

  const handleSelectTemplate = (t: MemeTemplate) => {
    setTemplate(t);
    setImageLoaded(false);
    setShowTemplates(false);
  };

  const handleDownload = useCallback(async () => {
    await downloadMeme(imageUrl, { topText, bottomText }, `${ticker || "portfolio"}-meme.png`);
  }, [imageUrl, topText, bottomText, ticker]);

  const handleShare = useCallback(async (platform: "twitter" | "copy") => {
    const text = `${topText} - ${bottomText}`;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  }, [topText, bottomText]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{ticker || "Portfolio"} Meme</h3>
        <span className={`text-sm font-medium ${percentageReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
          {percentageReturn >= 0 ? "+" : ""}{percentageReturn.toFixed(1)}%
        </span>
      </div>

      {/* Text Inputs */}
      <div className="space-y-2">
        <input
          type="text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          placeholder="Top text"
          className="w-full px-3 py-2 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          placeholder="Bottom text"
          className="w-full px-3 py-2 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Meme Preview */}
      <div className="relative bg-black rounded overflow-hidden">
        {!imageLoaded && (
          <div className="aspect-square flex items-center justify-center text-gray-400">
            Loading...
          </div>
        )}
        <img
          src={imageUrl}
          alt="Meme"
          className={`w-full ${imageLoaded ? "block" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
        />
        {imageLoaded && (
          <>
            <div className="absolute top-2 left-0 right-0 text-center px-2">
              <span
                className="text-white font-bold uppercase break-words"
                style={{
                  fontSize: "clamp(12px, 4vw, 24px)",
                  textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                  fontFamily: "Impact, sans-serif",
                }}
              >
                {topText}
              </span>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center px-2">
              <span
                className="text-white font-bold uppercase break-words"
                style={{
                  fontSize: "clamp(12px, 4vw, 24px)",
                  textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                  fontFamily: "Impact, sans-serif",
                }}
              >
                {bottomText}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Template Selection */}
      <div className="flex gap-2">
        <button
          onClick={handleRandomTemplate}
          className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
        >
          Random Template
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
        >
          {showTemplates ? "Hide" : "Choose"} Template
        </button>
      </div>

      {/* Template Grid */}
      {showTemplates && (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {memeTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={`p-1 rounded border-2 transition-colors ${
                template.id === t.id ? "border-blue-500" : "border-transparent hover:border-gray-500"
              }`}
              title={t.name}
            >
              <img
                src={getMemeImageUrl(t)}
                alt={t.name}
                className="w-full aspect-square object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
        >
          Download
        </button>
        <button
          onClick={() => handleShare("twitter")}
          className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 rounded text-sm font-medium transition-colors"
        >
          Tweet
        </button>
        <button
          onClick={() => handleShare("copy")}
          className="py-2 px-3 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { selectMemeTemplate, formatMemeText, getMemeImageUrl, memeTemplates } from "@/lib/imgflip";
import { downloadMeme, renderMemeToCanvas } from "@/lib/memeRenderer";
import { useToast } from "@/components/Toast";
import { SkeletonImage } from "@/components/Skeleton";
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
  const [canShare, setCanShare] = useState(false);
  const { showToast } = useToast();

  // Check if Web Share API is available (must be done client-side)
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

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
    showToast("Meme downloaded!", "success");
  }, [imageUrl, topText, bottomText, ticker, showToast]);

  const handleShare = useCallback(async (platform: "twitter" | "reddit" | "copy" | "native") => {
    const text = `${topText} - ${bottomText}`;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "reddit") {
      const title = encodeURIComponent(text);
      window.open(`https://www.reddit.com/submit?title=${title}`, "_blank");
    } else if (platform === "native") {
      // Use Web Share API for native sharing (with image if supported)
      if (navigator.share) {
        try {
          // Try to share with image
          const canvas = await renderMemeToCanvas(imageUrl, { topText, bottomText });
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/png");
          });
          const file = new File([blob], `${ticker || "portfolio"}-meme.png`, { type: "image/png" });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Portfolio Meme",
              text,
              files: [file],
            });
          } else {
            // Fallback to text-only share
            await navigator.share({
              title: "Portfolio Meme",
              text,
            });
          }
          showToast("Shared successfully!", "success");
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            showToast("Could not share", "error");
          }
        }
      } else {
        showToast("Web Share not supported", "error");
      }
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!", "success");
    }
  }, [topText, bottomText, imageUrl, ticker, showToast]);

  // Group templates by performance tier
  const groupedTemplates = {
    gains: memeTemplates.filter(t => t.minReturn >= 10),
    moderate: memeTemplates.filter(t => t.minReturn >= -10 && t.minReturn < 10),
    losses: memeTemplates.filter(t => t.minReturn < -10),
  };

  return (
    <div className="card rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{ticker || "Portfolio"} Meme</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          percentageReturn >= 0
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}>
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
          className="w-full px-3 py-2 bg-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
        />
        <input
          type="text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          placeholder="Bottom text"
          className="w-full px-3 py-2 bg-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
        />
      </div>

      {/* Meme Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {!imageLoaded && <SkeletonImage />}
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
          className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all border border-gray-600 hover:border-gray-500"
        >
          🎲 Random
        </button>
        <button
          onClick={() => setShowTemplates(true)}
          className="flex-1 py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all border border-gray-600 hover:border-gray-500"
        >
          🖼️ Browse Templates
        </button>
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="card rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scaleIn flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Choose Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              {/* Gains Templates */}
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Big Gains (+10% and up)
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {groupedTemplates.gains.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`template-item p-1 border-2 transition-all ${
                        template.id === t.id ? "border-blue-500" : "border-transparent hover:border-gray-500"
                      }`}
                      title={t.name}
                    >
                      <img
                        src={getMemeImageUrl(t)}
                        alt={t.name}
                        className="w-full aspect-square object-cover rounded"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white truncate opacity-0 hover:opacity-100 transition-opacity z-20">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderate Templates */}
              <div>
                <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Moderate (-10% to +10%)
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {groupedTemplates.moderate.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`template-item p-1 border-2 transition-all ${
                        template.id === t.id ? "border-blue-500" : "border-transparent hover:border-gray-500"
                      }`}
                      title={t.name}
                    >
                      <img
                        src={getMemeImageUrl(t)}
                        alt={t.name}
                        className="w-full aspect-square object-cover rounded"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Loss Templates */}
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Losses (Below -10%)
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {groupedTemplates.losses.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`template-item p-1 border-2 transition-all ${
                        template.id === t.id ? "border-blue-500" : "border-transparent hover:border-gray-500"
                      }`}
                      title={t.name}
                    >
                      <img
                        src={getMemeImageUrl(t)}
                        alt={t.name}
                        className="w-full aspect-square object-cover rounded"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleDownload}
          className="flex-1 py-2 px-3 btn-success rounded-lg text-sm font-medium transition-all min-w-[80px]"
        >
          Download
        </button>
        <button
          onClick={() => handleShare("twitter")}
          className="py-2 px-3 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-medium transition-all"
          title="Share on Twitter"
        >
          𝕏
        </button>
        <button
          onClick={() => handleShare("reddit")}
          className="py-2 px-3 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium transition-all"
          title="Share on Reddit"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        </button>
        {canShare && (
          <button
            onClick={() => handleShare("native")}
            className="py-2 px-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all"
            title="Share"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => handleShare("copy")}
          className="py-2 px-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-all"
          title="Copy text"
        >
          📋
        </button>
      </div>
    </div>
  );
}

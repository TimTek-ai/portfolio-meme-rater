"use client";

import { useCallback } from "react";
import Papa from "papaparse";
import { parsePortfolioCsv } from "@/lib/portfolio";
import { useToast } from "@/components/Toast";
import type { PortfolioRow } from "@/types/portfolio";

interface CsvUploaderProps {
  onUpload: (rows: PortfolioRow[]) => void;
}

export function CsvUploader({ onUpload }: CsvUploaderProps) {
  const { showToast } = useToast();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = parsePortfolioCsv(results.data);
          onUpload(rows);
        },
        error: (error) => {
          console.error("CSV parse error:", error);
          showToast("Failed to parse CSV file", "error");
        },
      });
    },
    [onUpload, showToast]
  );

  return (
    <div className="card border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500/50 transition-all cursor-pointer group">
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="space-y-3">
          <div className="text-5xl group-hover:animate-bounce-subtle transition-transform">📈</div>
          <p className="text-lg font-medium">Upload Portfolio CSV</p>
          <p className="text-sm text-gray-400">
            Expected columns: ticker, shares, purchasePrice, currentPrice
          </p>
        </div>
      </label>
    </div>
  );
}

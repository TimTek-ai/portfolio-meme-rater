"use client";

import { useCallback } from "react";
import Papa from "papaparse";
import { parsePortfolioCsv } from "@/lib/portfolio";
import type { PortfolioRow } from "@/types/portfolio";

interface CsvUploaderProps {
  onUpload: (rows: PortfolioRow[]) => void;
}

export function CsvUploader({ onUpload }: CsvUploaderProps) {
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
          alert("Failed to parse CSV file");
        },
      });
    },
    [onUpload]
  );

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="text-4xl">📈</div>
          <p className="text-lg font-medium">Upload Portfolio CSV</p>
          <p className="text-sm text-gray-400">
            Expected columns: ticker, shares, purchasePrice, currentPrice
          </p>
        </div>
      </label>
    </div>
  );
}

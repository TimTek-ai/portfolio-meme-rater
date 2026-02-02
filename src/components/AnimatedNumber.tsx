"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  formatFn = (v) => v.toLocaleString(),
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatFn(displayValue)}</span>;
}

export function AnimatedCurrency({
  value,
  duration = 1000,
  className = "",
}: Omit<AnimatedNumberProps, "formatFn">) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      formatFn={formatCurrency}
      className={className}
    />
  );
}

export function AnimatedPercent({
  value,
  duration = 1000,
  className = "",
}: Omit<AnimatedNumberProps, "formatFn">) {
  const formatPercent = (v: number) => {
    const sign = v >= 0 ? "+" : "";
    return `${sign}${v.toFixed(2)}%`;
  };

  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      formatFn={formatPercent}
      className={className}
    />
  );
}

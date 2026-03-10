"use client";

import { useEffect, useState } from "react";

interface SingleGaugeProps {
  score: number;
  label: string;
}

function scoreColor(score: number): string {
  if (score <= 40) return "#ef4444";
  if (score <= 70) return "#eab308";
  return "#22c55e";
}

function SingleGauge({ score, label }: SingleGaugeProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 50);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = 70;
  const stroke = 12;
  const cx = 90;
  const cy = 90;
  const startAngle = 210;
  const sweepAngle = 300;

  function polarToCartesian(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number) {
    const s = polarToCartesian(startDeg);
    const e = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const trackEnd = startAngle + sweepAngle;
  const valueEnd = startAngle + (sweepAngle * animated) / 100;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="180" height="160" viewBox="0 0 180 160" aria-label={`${label}: ${score}`}>
        <path
          d={describeArc(startAngle, trackEnd)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={describeArc(startAngle, Math.max(startAngle + 0.5, valueEnd))}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            transition: "d 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          fontSize="11"
          fill="#6b7280"
        >
          / 100
        </text>
      </svg>
      <span className="text-sm font-medium text-gray-600 -mt-4">{label}</span>
    </div>
  );
}

interface SeoScoreGaugeProps {
  currentScore: number;
  projectedScore: number;
}

export function SeoScoreGauge({ currentScore, projectedScore }: SeoScoreGaugeProps) {
  return (
    <div className="flex items-center justify-center gap-10 flex-wrap">
      <SingleGauge score={currentScore} label="Current Score" />
      <SingleGauge score={projectedScore} label="Projected Score" />
    </div>
  );
}

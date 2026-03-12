"use client";

import { useEffect, useState } from "react";

interface SingleBarProps {
  score: number;
  label: string;
}

function scoreColor(score: number): string {
  if (score <= 40) return "#EF4444";
  if (score <= 70) return "#F59E0B";
  return "#10B981";
}

function scoreLabel(score: number): string {
  if (score <= 40) return "Poor";
  if (score <= 70) return "Needs work";
  if (score <= 90) return "Good";
  return "Excellent";
}

function SingleBar({ score, label }: SingleBarProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(score), 80);
    return () => clearTimeout(timeout);
  }, [score]);

  const color = scoreColor(score);

  return (
    <div style={{ width: "100%" }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>/100</span>
          <span style={{
            marginLeft: 4,
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            background: `${color}35`,
            color,
          }}>
            {scoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Track */}
      <div style={{
        height: 10,
        width: "100%",
        borderRadius: 999,
        background: "rgba(255,255,255,0.18)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Fill */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${animated}%`,
          borderRadius: 999,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}90`,
          transition: "width 0.75s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>

      {/* Threshold ticks */}
      <div style={{ position: "relative", height: 6, marginTop: 2 }}>
        <div style={{ position: "absolute", left: "40%", top: 0, width: 1, height: 6, background: "rgba(255,255,255,0.25)" }} />
        <div style={{ position: "absolute", left: "70%", top: 0, width: 1, height: 6, background: "rgba(255,255,255,0.25)" }} />
      </div>
    </div>
  );
}

interface SeoScoreGaugeProps {
  currentScore: number;
  projectedScore: number;
  currentAnalysis?: string;
  projectedAnalysis?: string;
}

function ScoreRow({ score, label, analysis }: { score: number; label: string; analysis?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div style={{ flex: "0 0 40%", minWidth: 0 }}>
        <SingleBar score={score} label={label} />
      </div>
      {analysis && (
        <div style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.75)",
          paddingTop: 2,
        }}>
          {analysis}
        </div>
      )}
    </div>
  );
}

export function SeoScoreGauge({ currentScore, projectedScore, currentAnalysis, projectedAnalysis }: SeoScoreGaugeProps) {
  return (
    <div style={{
      borderRadius: 10,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      background: "linear-gradient(135deg, #021039 0%, #1B4F8A 100%)",
      boxShadow: "0 2px 12px rgba(26,122,74,0.25)",
    }}>
      <ScoreRow score={currentScore} label="Current Score" analysis={currentAnalysis} />
      <ScoreRow score={projectedScore} label="Projected Score" analysis={projectedAnalysis} />
    </div>
  );
}

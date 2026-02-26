"use client";

import { useState, useMemo } from "react";
import { Tabs } from "@/components/ui/tabs";
import { quartiles } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const INDICATORS = [
  { id: "booksPerStudent", label: "1인당 장서", fn: (u: University) => u.indicators.booksPerStudent, unit: "권" },
  { id: "budgetPerStudent", label: "1인당 예산", fn: (u: University) => u.indicators.budgetPerStudent / 10000, unit: "만원" },
  { id: "loansPerStudent", label: "1인당 대출", fn: (u: University) => u.indicators.loansPerStudent, unit: "권" },
  { id: "borrowerRatio", label: "대출자 비율", fn: (u: University) => u.indicators.borrowerRatio, unit: "%" },
];

const GROUPS = ["국립", "사립", "공립"] as const;

function BoxPlotSvg({ stats, max, color, label }: {
  stats: { min: number; q1: number; median: number; q3: number; max: number; iqr: number };
  max: number;
  color: string;
  label: string;
}) {
  const w = 100;
  const scale = (v: number) => max === 0 ? 0 : (v / max) * w;
  const whiskerLo = Math.max(stats.min, stats.q1 - 1.5 * stats.iqr);
  const whiskerHi = Math.min(stats.max, stats.q3 + 1.5 * stats.iqr);

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-xs text-rinfo-600">{label}</span>
      <svg viewBox={`0 0 ${w + 10} 24`} className="h-8 flex-1" preserveAspectRatio="none">
        {/* whisker line */}
        <line x1={scale(whiskerLo) + 5} y1={12} x2={scale(whiskerHi) + 5} y2={12} stroke={color} strokeWidth={1} />
        {/* whisker caps */}
        <line x1={scale(whiskerLo) + 5} y1={6} x2={scale(whiskerLo) + 5} y2={18} stroke={color} strokeWidth={1} />
        <line x1={scale(whiskerHi) + 5} y1={6} x2={scale(whiskerHi) + 5} y2={18} stroke={color} strokeWidth={1} />
        {/* box */}
        <rect x={scale(stats.q1) + 5} y={4} width={scale(stats.q3) - scale(stats.q1)} height={16} fill={color} opacity={0.3} stroke={color} strokeWidth={1} rx={2} />
        {/* median */}
        <line x1={scale(stats.median) + 5} y1={4} x2={scale(stats.median) + 5} y2={20} stroke={color} strokeWidth={2} />
      </svg>
      <span className="w-28 text-[10px] text-rinfo-500">
        Q1={stats.q1.toFixed(1)} Med={stats.median.toFixed(1)} Q3={stats.q3.toFixed(1)}
      </span>
    </div>
  );
}

export function BoxPlotChart({ universities }: Props) {
  const [indId, setIndId] = useState("booksPerStudent");
  const indicator = INDICATORS.find((i) => i.id === indId) || INDICATORS[0];

  const { groupStats, globalMax, narrative } = useMemo(() => {
    const active = universities.filter((u) => u.studentsCurrYear > 0);
    const allStats: { label: string; stats: ReturnType<typeof quartiles>; color: string }[] = [];

    for (const group of GROUPS) {
      const vals = active.filter((u) => u.type === group).map(indicator.fn).filter((v) => isFinite(v) && v >= 0);
      if (vals.length < 5) continue;
      allStats.push({ label: group, stats: quartiles(vals), color: group === "국립" ? "#3d7a28" : group === "사립" ? "#5bacd8" : "#ff8b54" });
    }

    const allVals = active.map(indicator.fn).filter((v) => isFinite(v) && v >= 0);
    allStats.unshift({ label: "전체", stats: quartiles(allVals), color: "#666" });

    const gMax = Math.max(...allStats.map((s) => s.stats.q3 + 1.5 * s.stats.iqr));

    const overall = allStats[0].stats;
    const n = `${indicator.label}의 전체 중앙값은 ${overall.median.toFixed(1)}${indicator.unit}이며, ` +
      `사분위 범위(IQR)는 ${overall.iqr.toFixed(1)}${indicator.unit}입니다. ` +
      allStats.slice(1).map((s) =>
        `${s.label}의 중앙값은 ${s.stats.median.toFixed(1)}${indicator.unit}(IQR: ${s.stats.iqr.toFixed(1)})`
      ).join(", ") + ". " +
      `IQR이 클수록 해당 설립유형 내 대학 간 편차가 크다는 의미입니다.`;

    return { groupStats: allStats, globalMax: gMax, narrative: n };
  }, [universities, indicator]);

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={INDICATORS.map((i) => ({ id: i.id, label: i.label }))} defaultTab={indId} onChange={setIndId} />
      </div>
      <div className="rounded-xl border border-rinfo-200 bg-white p-4 shadow-sm">
        <div className="space-y-2">
          {groupStats.map((g) => (
            <BoxPlotSvg key={g.label} stats={g.stats} max={globalMax} color={g.color} label={g.label} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-rinfo-400">
          <span>|── 위스커(1.5×IQR) ──|</span>
          <span className="inline-block h-3 w-6 rounded border border-rinfo-300 bg-rinfo-100" /> 사분위 범위(Q1~Q3)
          <span className="inline-block h-3 w-0.5 bg-rinfo-600" /> 중앙값
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

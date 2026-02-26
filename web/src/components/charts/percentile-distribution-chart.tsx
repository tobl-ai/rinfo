"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const INDICATORS = [
  { id: "booksPerStudent", label: "1인당 도서", fn: (u: University) => u.indicators.booksPerStudent, unit: "권" },
  { id: "budgetPerStudent", label: "1인당 예산", fn: (u: University) => u.indicators.budgetPerStudent / 10000, unit: "만원" },
  { id: "loansPerStudent", label: "1인당 대출", fn: (u: University) => u.indicators.loansPerStudent, unit: "권" },
  { id: "areaPerStudent", label: "1인당 면적", fn: (u: University) => u.indicators.areaPerStudent, unit: "㎡" },
];

function computePercentiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const pct = (p: number) => sorted[Math.floor(sorted.length * p)] ?? 0;
  return {
    p10: Math.round(pct(0.1) * 10) / 10,
    p25: Math.round(pct(0.25) * 10) / 10,
    p50: Math.round(pct(0.5) * 10) / 10,
    p75: Math.round(pct(0.75) * 10) / 10,
    p90: Math.round(pct(0.9) * 10) / 10,
    mean: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
  };
}

export function PercentileDistributionChart({ universities }: Props) {
  const [indicatorId, setIndicatorId] = useState("booksPerStudent");
  const indicator = INDICATORS.find((i) => i.id === indicatorId) || INDICATORS[0];

  const stats = useMemo(() => {
    const vals = universities.filter((u) => u.studentsCurrYear > 0).map(indicator.fn).filter((v) => isFinite(v) && v >= 0);
    return computePercentiles(vals);
  }, [universities, indicator]);

  const data = [
    { name: "하위 10%", value: stats.p10 },
    { name: "하위 25%", value: stats.p25 },
    { name: "중앙값", value: stats.p50 },
    { name: "상위 25%", value: stats.p75 },
    { name: "상위 10%", value: stats.p90 },
  ];

  const barColors = ["#e74c3c", "#ff8b54", "#f0c040", "#6aad2d", "#3d7a28"];

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={INDICATORS.map((i) => ({ id: i.id, label: i.label }))} defaultTab={indicatorId} onChange={setIndicatorId} />
      </div>
      <ChartWrapper height={300}>
        <BarChart data={data} margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
          <XAxis dataKey="name" fontSize={11} />
          <YAxis fontSize={11} />
          <ReferenceLine y={stats.mean} stroke="#5bacd8" strokeDasharray="5 5" label={{ value: `평균 ${stats.mean}`, fill: "#5bacd8", fontSize: 11 }} />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{label}</p>
                  <p className="text-rinfo-600">{payload[0]?.value} {indicator.unit}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={barColors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-1 text-center text-xs text-rinfo-400">
        파란 점선: 전체 평균 ({stats.mean} {indicator.unit})
      </p>
    </div>
  );
}

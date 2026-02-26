"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const MODES = [
  { id: "increase", label: "연간 증가" },
  { id: "discard", label: "연간 폐기" },
  { id: "net", label: "순증감" },
];

export function CollectionGrowthChart({ universities }: Props) {
  const [mode, setMode] = useState("increase");

  const getFn = (u: University) => {
    if (mode === "increase") return u.collection.annualIncrease;
    if (mode === "discard") return u.collection.annualDiscard;
    return u.collection.annualIncrease - u.collection.annualDiscard;
  };

  const groups: Record<string, number[]> = {};
  for (const u of universities) {
    const key = u.category || "기타";
    if (!groups[key]) groups[key] = [];
    groups[key].push(getFn(u));
  }

  const data = Object.entries(groups)
    .map(([name, vals]) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const median = [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)];
      return { name, avg: Math.round(avg), median: Math.round(median), count: vals.length };
    })
    .filter((d) => d.count >= 3)
    .sort((a, b) => b.avg - a.avg);

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={MODES} defaultTab={mode} onChange={setMode} />
      </div>
      <ChartWrapper height={350}>
        <BarChart data={data} margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
          <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={60} />
          <YAxis fontSize={11} />
          {mode === "net" && <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />}
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{label}</p>
                  <p className="text-rinfo-600">평균: {d?.avg?.toLocaleString()}권</p>
                  <p className="text-rinfo-600">중앙값: {d?.median?.toLocaleString()}권</p>
                  <p className="text-rinfo-600">대학 수: {d?.count}개</p>
                </div>
              );
            }}
          />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.avg >= 0 ? "#5b9a3c" : "#e74c3c"} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
    </div>
  );
}

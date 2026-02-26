"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function SizeRadarChart({ universities }: Props) {
  const sizes = ["대", "중", "소"];
  const metrics = [
    { key: "booksPerStudent", label: "1인당 도서" },
    { key: "budgetPerStudent", label: "1인당 예산" },
    { key: "loansPerStudent", label: "1인당 대출" },
    { key: "areaPerStudent", label: "1인당 면적" },
    { key: "staffPer1000", label: "1000명당 직원" },
    { key: "borrowerRatio", label: "대출자 비율" },
  ] as const;

  const bySize: Record<string, University[]> = {};
  for (const u of universities) {
    const s = u.size || "기타";
    if (!bySize[s]) bySize[s] = [];
    bySize[s].push(u);
  }

  const rawData = metrics.map((m) => {
    const entry: Record<string, string | number> = { metric: m.label };
    for (const s of sizes) {
      const group = bySize[s] || [];
      entry[s] = Math.round(avg(group.map((u) => u.indicators[m.key])));
    }
    return entry;
  });

  const maxVals = rawData.map((d) =>
    Math.max(...sizes.map((s) => Number(d[s]) || 0))
  );

  const data = rawData.map((d, i) => {
    const mx = maxVals[i] || 1;
    const normalized: Record<string, string | number> = { metric: d.metric };
    for (const s of sizes) {
      normalized[s] = Math.round(((Number(d[s]) || 0) / mx) * 100);
    }
    return normalized;
  });

  const colors = ["#5b9a3c", "#ff8b54", "#5bacd8"];

  return (
    <ChartWrapper height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#dcefd3" />
        <PolarAngleAxis dataKey="metric" fontSize={11} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
        {sizes.map((s, i) => (
          <Radar
            key={s}
            name={`${s}규모`}
            dataKey={s}
            stroke={colors[i]}
            fill={colors[i]}
            fillOpacity={0.15}
          />
        ))}
        <Legend />
        <Tooltip />
      </RadarChart>
    </ChartWrapper>
  );
}

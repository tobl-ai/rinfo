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

const COLORS = ["#f47721", "#5bba6f", "#4a90d9", "#ffb36e", "#b85213"];

const METRICS = [
  { key: "booksPerStudent", label: "1인당 도서" },
  { key: "budgetPerStudent", label: "1인당 예산" },
  { key: "loansPerStudent", label: "1인당 대출" },
  { key: "areaPerStudent", label: "1인당 면적" },
  { key: "staffPer1000", label: "1000명당 직원" },
  { key: "borrowerRatio", label: "대출자 비율" },
] as const;

export function CompareRadar({ universities }: Props) {
  const maxVals: Record<string, number> = {};
  for (const m of METRICS) {
    maxVals[m.key] = Math.max(
      ...universities.map((u) => u.indicators[m.key]),
      1
    );
  }

  const data = METRICS.map((m) => {
    const entry: Record<string, string | number> = { metric: m.label };
    for (const u of universities) {
      entry[u.name] = Math.round(
        (u.indicators[m.key] / maxVals[m.key]) * 100
      );
    }
    return entry;
  });

  return (
    <ChartWrapper height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#fff5eb" />
        <PolarAngleAxis dataKey="metric" fontSize={11} />
        <PolarRadiusAxis tick={false} domain={[0, 100]} />
        {universities.map((u, i) => (
          <Radar
            key={u.id}
            name={u.name}
            dataKey={u.name}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.1}
          />
        ))}
        <Legend />
        <Tooltip />
      </RadarChart>
    </ChartWrapper>
  );
}

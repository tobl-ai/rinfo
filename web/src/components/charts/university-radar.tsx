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
  university: University;
  averages: Record<string, number>;
}

export function UniversityRadar({ university, averages }: Props) {
  const metrics = [
    { key: "booksPerStudent", label: "1인당 도서" },
    { key: "budgetPerStudent", label: "1인당 예산" },
    { key: "loansPerStudent", label: "1인당 대출" },
    { key: "areaPerStudent", label: "1인당 면적" },
    { key: "staffPer1000", label: "1000명당 직원" },
    { key: "borrowerRatio", label: "대출자 비율" },
  ] as const;

  const data = metrics.map((m) => {
    const uVal = university.indicators[m.key];
    const avgVal = averages[m.key] || 1;
    return {
      metric: m.label,
      대학: Math.round((uVal / avgVal) * 100),
      평균: 100,
    };
  });

  return (
    <ChartWrapper height={350}>
      <RadarChart data={data}>
        <PolarGrid stroke="#fff5eb" />
        <PolarAngleAxis dataKey="metric" fontSize={11} />
        <PolarRadiusAxis tick={false} domain={[0, "auto"]} />
        <Radar
          name={university.name}
          dataKey="대학"
          stroke="#f47721"
          fill="#f47721"
          fillOpacity={0.3}
        />
        <Radar
          name="전체 평균"
          dataKey="평균"
          stroke="#5bba6f"
          fill="#5bba6f"
          fillOpacity={0.08}
          strokeDasharray="5 5"
        />
        <Legend />
        <Tooltip formatter={(v) => `${v}%`} />
      </RadarChart>
    </ChartWrapper>
  );
}

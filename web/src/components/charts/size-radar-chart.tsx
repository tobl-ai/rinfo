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

  const colors = ["#f47721", "#5bba6f", "#4a90d9"];

  return (
    <div>
      <ChartWrapper height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#fff5eb" />
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
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        대·중·소 규모별로 6개 지표를 비교한 레이더 차트입니다. 소규모 대학은 1인당 도서 수와 1인당 면적에서 강점을 보이는 반면, 대규모 대학은 절대적인 장서량과 이용자 수에서 앞섭니다. 각 값은 규모별 최댓값 대비 비율(%)로 정규화되어 있어 상대적 비교가 가능합니다.
      </p>
    </div>
  );
}

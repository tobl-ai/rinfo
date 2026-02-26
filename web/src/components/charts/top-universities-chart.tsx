"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const METRICS = [
  { id: "totalBooks", label: "소장 도서", unit: "만 권", fn: (u: University) => u.collection.totalBooks, divisor: 10000 },
  { id: "budget", label: "자료구입비", unit: "억원", fn: (u: University) => u.budget.materialBudgetTotal, divisor: 1_0000_0000 },
  { id: "loanBooks", label: "대출 책수", unit: "만 권", fn: (u: University) => u.usage.loanBooks, divisor: 10000 },
  { id: "visitors", label: "이용자 수", unit: "만 명", fn: (u: University) => u.usage.visitors, divisor: 10000 },
  { id: "booksPerStudent", label: "1인당 도서", unit: "권", fn: (u: University) => u.indicators.booksPerStudent, divisor: 1 },
];

const COLORS = [
  "#b85213", "#d96518", "#f47721", "#f58d3d", "#ffb36e",
  "#ffc48a", "#ffd4aa", "#ffe0c0", "#ffe8d0", "#fff0e0",
  "#fff3e6", "#fff5eb", "#fff7f0", "#fff9f4", "#fffaf7",
  "#fffbf8", "#fffcfa", "#fffdfb", "#fffefd", "#fffffe",
];

export function TopUniversitiesChart({ universities }: Props) {
  const [metricId, setMetricId] = useState("totalBooks");
  const metric = METRICS.find((m) => m.id === metricId) || METRICS[0];

  const data = [...universities]
    .sort((a, b) => metric.fn(b) - metric.fn(a))
    .slice(0, 20)
    .map((u) => ({
      name: u.name.length > 10 ? u.name.slice(0, 10) + "…" : u.name,
      fullName: u.name,
      value: Math.round((metric.fn(u) / metric.divisor) * 10) / 10,
      raw: metric.fn(u),
    }));

  const top1 = data[0];
  const top5Avg = data.slice(0, 5).reduce((s, d) => s + d.value, 0) / 5;
  const top20Avg = data.reduce((s, d) => s + d.value, 0) / data.length;

  return (
    <div>
      <div className="mb-3">
        <Tabs
          tabs={METRICS.map((m) => ({ id: m.id, label: m.label }))}
          defaultTab={metricId}
          onChange={setMetricId}
        />
      </div>
      <ChartWrapper height={500}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" horizontal={false} />
          <XAxis type="number" fontSize={11} />
          <YAxis type="category" dataKey="name" width={100} fontSize={11} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.fullName}</p>
                  <p className="text-rinfo-600">{d?.value} {metric.unit}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {metric.label} 기준 1위는 &quot;{top1?.fullName}&quot;({top1?.value} {metric.unit})입니다. 상위 5개 대학 평균은 {Math.round(top5Avg * 10) / 10} {metric.unit}, 상위 20개 평균은 {Math.round(top20Avg * 10) / 10} {metric.unit}으로, 상위권 대학 간에도 편차가 있습니다.
      </p>
    </div>
  );
}

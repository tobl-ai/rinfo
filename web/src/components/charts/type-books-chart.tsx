"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function TypeBooksChart({ universities }: Props) {
  const byCategory: Record<string, { domestic: number; foreign: number }> = {};

  for (const u of universities) {
    const cat = u.category || "기타";
    if (!byCategory[cat]) byCategory[cat] = { domestic: 0, foreign: 0 };
    byCategory[cat].domestic += u.collection.domestic.total;
    byCategory[cat].foreign += u.collection.foreign.total;
  }

  const data = Object.entries(byCategory)
    .map(([name, val]) => ({
      name,
      국내서: Math.round(val.domestic / 10000),
      국외서: Math.round(val.foreign / 10000),
    }))
    .sort((a, b) => b.국내서 + b.국외서 - (a.국내서 + a.국외서));

  const topCat = data[0];
  const totalDom = data.reduce((s, d) => s + d.국내서, 0);
  const totalFor = data.reduce((s, d) => s + d.국외서, 0);
  const forRatio = totalDom + totalFor > 0 ? Math.round((totalFor / (totalDom + totalFor)) * 100) : 0;

  return (
    <div>
      <ChartWrapper height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()}만 권`} />
          <Legend />
          <Bar dataKey="국내서" fill="#f47721" radius={[4, 4, 0, 0]} />
          <Bar dataKey="국외서" fill="#5bba6f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        소장 도서가 가장 많은 학교유형은 &quot;{topCat?.name}&quot;으로, 국내서 {topCat?.국내서.toLocaleString()}만 권과 국외서 {topCat?.국외서.toLocaleString()}만 권을 보유하고 있습니다. 전체적으로 국외서 비율은 {forRatio}%이며, 국내서가 대부분을 차지합니다.
      </p>
    </div>
  );
}

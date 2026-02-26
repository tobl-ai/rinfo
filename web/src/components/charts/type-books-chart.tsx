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

  return (
    <ChartWrapper height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip formatter={(v) => `${Number(v).toLocaleString()}만 권`} />
        <Legend />
        <Bar dataKey="국내서" fill="#5b9a3c" radius={[4, 4, 0, 0]} />
        <Bar dataKey="국외서" fill="#ff8b54" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartWrapper>
  );
}

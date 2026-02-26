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

export function EstablishmentBudgetChart({ universities }: Props) {
  const groups: Record<string, { books: number; digital: number; count: number }> = {};

  for (const u of universities) {
    const t = u.type || "기타";
    if (!groups[t]) groups[t] = { books: 0, digital: 0, count: 0 };
    groups[t].books += u.budget.domesticBooks + u.budget.foreignBooks;
    groups[t].digital += u.budget.digitalTotal;
    groups[t].count++;
  }

  const data = Object.entries(groups).map(([name, val]) => ({
    name,
    도서자료: Math.round(val.books / val.count / 1_0000),
    전자자료: Math.round(val.digital / val.count / 1_0000),
  }));

  return (
    <ChartWrapper height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip formatter={(v) => `${Number(v).toLocaleString()}만원`} />
        <Legend />
        <Bar dataKey="도서자료" fill="#5b9a3c" radius={[4, 4, 0, 0]} />
        <Bar dataKey="전자자료" fill="#5bacd8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartWrapper>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function BooksPerStudentChart({ universities }: Props) {
  const ranges = [
    { label: "0~10", min: 0, max: 10 },
    { label: "10~30", min: 10, max: 30 },
    { label: "30~50", min: 30, max: 50 },
    { label: "50~100", min: 50, max: 100 },
    { label: "100~200", min: 100, max: 200 },
    { label: "200+", min: 200, max: Infinity },
  ];

  const data = ranges.map((r) => ({
    name: r.label,
    count: universities.filter(
      (u) =>
        u.indicators.booksPerStudent >= r.min &&
        u.indicators.booksPerStudent < r.max
    ).length,
  }));

  const colors = [
    "#dcefd3",
    "#b8dfaa",
    "#8dc63f",
    "#5b9a3c",
    "#3d7a28",
    "#2d5c1e",
  ];

  return (
    <ChartWrapper height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
        <XAxis dataKey="name" fontSize={12} label={{ value: "권/인", position: "insideBottomRight", offset: -5 }} />
        <YAxis fontSize={12} label={{ value: "대학 수", angle: -90, position: "insideLeft" }} />
        <Tooltip formatter={(v) => `${v}개 대학`} />
        <Bar dataKey="count" name="대학 수" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} />
          ))}
        </Bar>
      </BarChart>
    </ChartWrapper>
  );
}

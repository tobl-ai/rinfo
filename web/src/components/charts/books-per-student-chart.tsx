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
    "#fff5eb",
    "#ffe0c0",
    "#ffb36e",
    "#f47721",
    "#b85213",
    "#8a3d0e",
  ];

  const mostCommon = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
  const under10 = data[0]?.count || 0;
  const over100 = (data[4]?.count || 0) + (data[5]?.count || 0);

  return (
    <div>
      <ChartWrapper height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
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
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        가장 많은 대학({mostCommon?.count}개)이 1인당 {mostCommon?.name}권 구간에 분포합니다. 1인당 10권 미만인 대학이 {under10}개, 100권 이상인 대학이 {over100}개로, 대학 간 장서 격차가 큽니다.
      </p>
    </div>
  );
}

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

  const highest = data.reduce((a, b) => (b.도서자료 + b.전자자료 > a.도서자료 + a.전자자료 ? b : a), data[0]);

  return (
    <div>
      <ChartWrapper height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()}만원`} />
          <Legend />
          <Bar dataKey="도서자료" fill="#f47721" radius={[4, 4, 0, 0]} />
          <Bar dataKey="전자자료" fill="#4a90d9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        설립주체별로 보면, &quot;{highest?.name}&quot; 대학의 평균 자료구입비가 가장 높습니다(도서 {highest?.도서자료.toLocaleString()}만원 + 전자 {highest?.전자자료.toLocaleString()}만원). 국립대학은 전자자료 비중이 상대적으로 높은 편이며, 사립대학은 도서자료 구입에 더 많은 예산을 배분하는 경향이 있습니다.
      </p>
    </div>
  );
}

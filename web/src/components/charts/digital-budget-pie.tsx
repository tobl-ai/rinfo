"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function DigitalBudgetPie({ universities }: Props) {
  let totalDigital = 0;
  let totalBooks = 0;

  for (const u of universities) {
    totalDigital += u.budget.digitalTotal;
    totalBooks += u.budget.domesticBooks + u.budget.foreignBooks;
  }
  const totalOther = Math.max(
    0,
    universities.reduce((s, u) => s + u.budget.materialBudgetTotal, 0) -
      totalBooks -
      totalDigital
  );

  const data = [
    { name: "도서자료", value: Math.round(totalBooks / 1_0000_0000) },
    { name: "전자자료", value: Math.round(totalDigital / 1_0000_0000) },
    { name: "기타자료", value: Math.round(totalOther / 1_0000_0000) },
  ].filter((d) => d.value > 0);

  const colors = ["#5b9a3c", "#5bacd8", "#e7e7e7"];

  return (
    <ChartWrapper height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `${v}억원`} />
        <Legend />
      </PieChart>
    </ChartWrapper>
  );
}

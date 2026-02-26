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

  const colors = ["#f47721", "#4a90d9", "#e7e7e7"];

  const total = data.reduce((s, d) => s + d.value, 0);
  const digitalPct = total > 0 ? Math.round((data.find((d) => d.name === "전자자료")?.value ?? 0) / total * 100) : 0;

  return (
    <div>
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
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        전체 대학의 자료구입비 합계 {total.toLocaleString()}억원 중 전자자료가 {digitalPct}%를 차지합니다. 도서관이 인쇄 도서뿐 아니라 전자저널, 웹DB, e-Book 등 디지털 자원에도 상당한 예산을 투입하고 있음을 알 수 있습니다.
      </p>
    </div>
  );
}

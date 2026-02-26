"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { coefficientOfVariation } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const INDICATORS = [
  { label: "1인당 장서", fn: (u: University) => u.indicators.booksPerStudent },
  { label: "1인당 예산", fn: (u: University) => u.indicators.budgetPerStudent },
  { label: "1인당 대출", fn: (u: University) => u.indicators.loansPerStudent },
  { label: "1인당 면적", fn: (u: University) => u.indicators.areaPerStudent },
  { label: "1000명당 직원", fn: (u: University) => u.indicators.staffPer1000 },
  { label: "전자자료 비율", fn: (u: University) => u.indicators.digitalBudgetRatio },
  { label: "대출자 비율", fn: (u: University) => u.indicators.borrowerRatio },
  { label: "예산 대비 구입비", fn: (u: University) => u.indicators.budgetRatio },
  { label: "소장 도서(총)", fn: (u: University) => u.collection.totalBooks },
  { label: "이용자 수", fn: (u: University) => u.usage.visitors },
];

export function CvComparisonChart({ universities }: Props) {
  const { data, narrative } = useMemo(() => {
    const active = universities.filter((u) => u.studentsCurrYear > 0);
    const results = INDICATORS.map((ind) => {
      const vals = active.map(ind.fn).filter((v) => isFinite(v) && v >= 0);
      const cv = coefficientOfVariation(vals);
      return { name: ind.label, cv: Math.round(cv * 1000) / 10 };
    }).sort((a, b) => b.cv - a.cv);

    const most = results[0];
    const least = results[results.length - 1];
    const n = `변동계수(CV)는 평균 대비 표준편차의 비율로, 단위가 다른 지표 간 산포도를 비교할 수 있습니다. ` +
      `대학 간 편차가 가장 큰 지표는 "${most.name}"(CV=${most.cv}%)이며, ` +
      `가장 균일한 지표는 "${least.name}"(CV=${least.cv}%)입니다. ` +
      `CV가 100%를 초과하면 표준편차가 평균보다 크다는 의미로, 대학 간 극심한 격차를 나타냅니다.`;

    return { data: results, narrative: n };
  }, [universities]);

  return (
    <div>
      <ChartWrapper height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" horizontal={false} />
          <XAxis type="number" fontSize={11} unit="%" />
          <YAxis type="category" dataKey="name" width={110} fontSize={11} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-600">변동계수: {d?.cv}%</p>
                  <p className="text-rinfo-400">{d?.cv > 100 ? "극심한 격차" : d?.cv > 50 ? "큰 격차" : "보통 수준"}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="cv" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.cv > 100 ? "#e74c3c" : d.cv > 50 ? "#ff8b54" : "#5b9a3c"} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

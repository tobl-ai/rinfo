"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line, ComposedChart, ReferenceLine } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import { giniCoefficient } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const RESOURCES = [
  { id: "books", label: "소장 도서", fn: (u: University) => u.collection.totalBooks },
  { id: "budget", label: "자료구입비", fn: (u: University) => u.budget.materialBudgetTotal },
  { id: "loans", label: "대출 책수", fn: (u: University) => u.usage.loanBooks },
  { id: "digital", label: "전자자료 예산", fn: (u: University) => u.budget.digitalTotal },
];

export function GiniLorenzChart({ universities }: Props) {
  const [resId, setResId] = useState("books");
  const resource = RESOURCES.find((r) => r.id === resId) || RESOURCES[0];

  const { data, gini, narrative } = useMemo(() => {
    const values = universities.map(resource.fn).filter((v) => v > 0);
    const result = giniCoefficient(values);

    const chartData = result.lorenz.map((p) => ({
      x: p.x,
      실제분포: p.y,
      완전평등: p.x,
    }));

    const level = result.gini >= 0.5 ? "높은" : result.gini >= 0.35 ? "상당한" : result.gini >= 0.2 ? "보통 수준의" : "낮은";
    const top10Share = (() => {
      const sorted = [...values].sort((a, b) => b - a);
      const top10 = sorted.slice(0, Math.ceil(sorted.length * 0.1));
      return Math.round((top10.reduce((a, b) => a + b, 0) / values.reduce((a, b) => a + b, 0)) * 1000) / 10;
    })();
    const bottom50Share = (() => {
      const sorted = [...values].sort((a, b) => a - b);
      const bottom50 = sorted.slice(0, Math.floor(sorted.length * 0.5));
      return Math.round((bottom50.reduce((a, b) => a + b, 0) / values.reduce((a, b) => a + b, 0)) * 1000) / 10;
    })();

    const n = `${resource.label}의 지니계수는 ${result.gini.toFixed(3)}으로, 대학 간 ${level} 불평등이 존재합니다. ` +
      `상위 10% 대학이 전체 ${resource.label}의 ${top10Share}%를 보유하며, ` +
      `하위 50% 대학은 전체의 ${bottom50Share}%만을 차지합니다. ` +
      `로렌츠 곡선이 완전평등선(대각선)에서 멀어질수록 자원 집중도가 높음을 의미합니다.`;

    return { data: chartData, gini: result.gini, narrative: n };
  }, [universities, resource]);

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={RESOURCES.map((r) => ({ id: r.id, label: r.label }))} defaultTab={resId} onChange={setResId} />
      </div>
      <div className="mb-2 flex gap-4 text-xs">
        <span className="rounded bg-rinfo-100 px-2 py-1 font-mono font-bold text-rinfo-800">
          Gini = {gini.toFixed(3)}
        </span>
        <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">
          0 = 완전평등 / 1 = 완전불평등
        </span>
      </div>
      <ChartWrapper height={400}>
        <ComposedChart data={data} margin={{ bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis dataKey="x" type="number" fontSize={11} unit="%" label={{ value: "누적 대학 비율", position: "insideBottom", offset: -2, fontSize: 10 }} />
          <YAxis type="number" fontSize={11} unit="%" label={{ value: "누적 자원 비율", angle: -90, position: "insideLeft", fontSize: 10 }} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="text-rinfo-600">하위 {d?.x}% 대학</p>
                  <p className="text-rinfo-800 font-semibold">{resource.label}의 {d?.실제분포}% 보유</p>
                  <p className="text-gray-400">완전평등 시: {d?.완전평등}%</p>
                </div>
              );
            }}
          />
          <Line dataKey="완전평등" stroke="#ccc" strokeDasharray="5 5" dot={false} />
          <Area dataKey="실제분포" stroke="#f47721" fill="#f47721" fillOpacity={0.2} dot={false} />
        </ComposedChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

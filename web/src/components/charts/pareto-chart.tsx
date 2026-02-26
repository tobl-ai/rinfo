"use client";

import { useState, useMemo } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const RESOURCES = [
  { id: "budget", label: "자료구입비", fn: (u: University) => u.budget.materialBudgetTotal, unit: "억원", div: 1_0000_0000 },
  { id: "books", label: "소장 도서", fn: (u: University) => u.collection.totalBooks, unit: "만권", div: 10000 },
  { id: "loans", label: "대출 책수", fn: (u: University) => u.usage.loanBooks, unit: "만권", div: 10000 },
  { id: "visitors", label: "이용자 수", fn: (u: University) => u.usage.visitors, unit: "만명", div: 10000 },
];

export function ParetoChart({ universities }: Props) {
  const [resId, setResId] = useState("budget");
  const resource = RESOURCES.find((r) => r.id === resId) || RESOURCES[0];

  const { data, narrative } = useMemo(() => {
    const sorted = [...universities]
      .map((u) => ({ name: u.name, value: resource.fn(u) }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = sorted.reduce((s, d) => s + d.value, 0);
    let cumulative = 0;

    // 상위 30개 + 나머지 그룹화
    const top = sorted.slice(0, 30);
    const chartData = top.map((d) => {
      cumulative += d.value;
      return {
        name: d.name.length > 8 ? d.name.slice(0, 8) + "…" : d.name,
        fullName: d.name,
        value: Math.round((d.value / resource.div) * 10) / 10,
        cumPct: Math.round((cumulative / total) * 1000) / 10,
      };
    });

    // 파레토 분석
    const pct20Count = Math.ceil(sorted.length * 0.2);
    const top20Sum = sorted.slice(0, pct20Count).reduce((s, d) => s + d.value, 0);
    const top20Pct = Math.round((top20Sum / total) * 1000) / 10;

    const pct10Count = Math.ceil(sorted.length * 0.1);
    const top10Sum = sorted.slice(0, pct10Count).reduce((s, d) => s + d.value, 0);
    const top10Pct = Math.round((top10Sum / total) * 1000) / 10;

    const n = `파레토 분석 결과, 상위 20%(${pct20Count}개) 대학이 전체 ${resource.label}의 ${top20Pct}%를 차지합니다. ` +
      `상위 10%(${pct10Count}개)만으로도 ${top10Pct}%에 달합니다. ` +
      `${top20Pct > 70 ? "80/20 법칙에 근접한 자원 집중 현상이 뚜렷합니다." : "자원 분배가 비교적 균등한 편입니다."}`;

    return { data: chartData, narrative: n };
  }, [universities, resource]);

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={RESOURCES.map((r) => ({ id: r.id, label: r.label }))} defaultTab={resId} onChange={setResId} />
      </div>
      <ChartWrapper height={450}>
        <ComposedChart data={data} margin={{ left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
          <XAxis dataKey="name" fontSize={9} angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" fontSize={11} unit="%" domain={[0, 100]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.fullName}</p>
                  <p className="text-rinfo-600">{d?.value} {resource.unit}</p>
                  <p className="text-rinfo-500">누적: {d?.cumPct}%</p>
                </div>
              );
            }}
          />
          <Bar yAxisId="left" dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i < data.length * 0.2 ? "#3d7a28" : i < data.length * 0.5 ? "#6aad2d" : "#b8dfaa"} />
            ))}
          </Bar>
          <Line yAxisId="right" dataKey="cumPct" stroke="#e74c3c" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

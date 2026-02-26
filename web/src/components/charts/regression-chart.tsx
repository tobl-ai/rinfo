"use client";

import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Line, ComposedChart } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import { linearRegression } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const PAIRS = [
  {
    id: "budget-loan", label: "예산→대출",
    xFn: (u: University) => u.indicators.budgetPerStudent / 10000,
    yFn: (u: University) => u.indicators.loansPerStudent,
    xLabel: "1인당 자료구입비(만원)", yLabel: "1인당 대출(권)",
  },
  {
    id: "books-loan", label: "장서→대출",
    xFn: (u: University) => u.indicators.booksPerStudent,
    yFn: (u: University) => u.indicators.loansPerStudent,
    xLabel: "1인당 장서(권)", yLabel: "1인당 대출(권)",
  },
  {
    id: "staff-visit", label: "직원→방문",
    xFn: (u: University) => u.indicators.staffPer1000,
    yFn: (u: University) => u.studentsCurrYear > 0 ? u.usage.visitors / u.studentsCurrYear : 0,
    xLabel: "1000명당 직원(명)", yLabel: "1인당 방문(회)",
  },
  {
    id: "digital-download", label: "전자투자→활용",
    xFn: (u: University) => u.indicators.digitalBudgetRatio,
    yFn: (u: University) => u.studentsCurrYear > 0 ? (u.eService.dbDownloadsFulltext) / u.studentsCurrYear : 0,
    xLabel: "전자자료 비율(%)", yLabel: "1인당 DB다운로드(건)",
  },
];

export function RegressionChart({ universities }: Props) {
  const [pairId, setPairId] = useState("budget-loan");
  const pair = PAIRS.find((p) => p.id === pairId) || PAIRS[0];

  const { data, reg, narrative } = useMemo(() => {
    const pts = universities
      .filter((u) => u.studentsCurrYear > 0)
      .map((u) => ({
        name: u.name,
        x: Math.round(pair.xFn(u) * 100) / 100,
        y: Math.round(pair.yFn(u) * 100) / 100,
      }))
      .filter((d) => isFinite(d.x) && isFinite(d.y) && d.x > 0 && d.y > 0);

    const r = linearRegression(pts.map((p) => p.x), pts.map((p) => p.y));

    const xMin = Math.min(...pts.map((p) => p.x));
    const xMax = Math.max(...pts.map((p) => p.x));
    const trendline = [
      { x: xMin, y: r.slope * xMin + r.intercept, trend: r.slope * xMin + r.intercept },
      { x: xMax, y: r.slope * xMax + r.intercept, trend: r.slope * xMax + r.intercept },
    ];

    const strength = Math.abs(r.r) >= 0.7 ? "강한" : Math.abs(r.r) >= 0.4 ? "보통" : Math.abs(r.r) >= 0.2 ? "약한" : "거의 없는";
    const direction = r.r > 0 ? "양의" : "음의";
    const explanation = r.r2;
    const n = `${pair.xLabel}과 ${pair.yLabel} 사이에 ${strength} ${direction} 상관관계(r=${r.r.toFixed(3)})가 관찰됩니다. ` +
      `결정계수(R²=${r2Fmt(explanation)})는 ${pair.xLabel} 변동이 ${pair.yLabel} 변동의 ${(explanation * 100).toFixed(1)}%를 설명함을 의미합니다. ` +
      `회귀식: y = ${r.slope.toFixed(4)}x + ${r.intercept.toFixed(2)} (n=${pts.length}).`;

    return { data: pts, reg: { ...r, trendline }, narrative: n };
  }, [universities, pair]);

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={PAIRS.map((p) => ({ id: p.id, label: p.label }))} defaultTab={pairId} onChange={setPairId} />
      </div>
      <div className="mb-2 flex gap-4 text-xs">
        <span className="rounded bg-rinfo-100 px-2 py-1 font-mono text-rinfo-700">
          r = {reg.r.toFixed(3)}
        </span>
        <span className="rounded bg-rinfo-100 px-2 py-1 font-mono text-rinfo-700">
          R² = {r2Fmt(reg.r2)}
        </span>
        <span className="rounded bg-rinfo-100 px-2 py-1 font-mono text-rinfo-700">
          n = {data.length}
        </span>
      </div>
      <ChartWrapper height={400}>
        <ComposedChart data={data} margin={{ bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis type="number" dataKey="x" name={pair.xLabel} fontSize={11} />
          <YAxis type="number" dataKey="y" name={pair.yLabel} fontSize={11} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-600">{pair.xLabel}: {d?.x}</p>
                  <p className="text-rinfo-600">{pair.yLabel}: {d?.y}</p>
                </div>
              );
            }}
          />
          <Scatter dataKey="y" fill="#4a90d9" fillOpacity={0.5} />
          <Line
            data={reg.trendline}
            dataKey="trend"
            stroke="#e74c3c"
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={false}
            legendType="none"
          />
        </ComposedChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

function r2Fmt(v: number) {
  return v.toFixed(3);
}

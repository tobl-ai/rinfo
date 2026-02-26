"use client";

import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const AXES = [
  {
    id: "budgetVsLoan",
    label: "예산 → 대출",
    xFn: (u: University) => u.indicators.budgetPerStudent,
    yFn: (u: University) => u.indicators.loansPerStudent,
    xLabel: "1인당 자료구입비 (만원)",
    yLabel: "1인당 대출 책수",
    xDiv: 10000,
    yDiv: 1,
  },
  {
    id: "staffVsVisitor",
    label: "직원 → 이용",
    xFn: (u: University) => u.indicators.staffPer1000,
    yFn: (u: University) => u.usage.visitors / Math.max(u.studentsCurrYear, 1),
    xLabel: "1,000명당 직원 수",
    yLabel: "1인당 방문자 수",
    xDiv: 1,
    yDiv: 1,
  },
  {
    id: "areaVsBorrow",
    label: "면적 → 대출",
    xFn: (u: University) => u.indicators.areaPerStudent,
    yFn: (u: University) => u.indicators.borrowerRatio,
    xLabel: "1인당 면적 (㎡)",
    yLabel: "대출자 비율 (%)",
    xDiv: 1,
    yDiv: 1,
  },
];

const TYPE_COLORS: Record<string, string> = {
  "국립": "#b85213",
  "공립": "#f58d3d",
  "사립": "#4a90d9",
  "특별법법인": "#5bba6f",
};

export function EfficiencyScatter({ universities }: Props) {
  const [axisId, setAxisId] = useState("budgetVsLoan");
  const axis = AXES.find((a) => a.id === axisId) || AXES[0];

  const data = universities
    .filter((u) => u.studentsCurrYear > 0)
    .map((u) => ({
      name: u.name,
      type: u.type,
      x: Math.round((axis.xFn(u) / axis.xDiv) * 10) / 10,
      y: Math.round((axis.yFn(u) / axis.yDiv) * 10) / 10,
      z: u.studentsCurrYear,
    }))
    .filter((d) => d.x > 0 && d.y > 0 && isFinite(d.x) && isFinite(d.y));

  const types = [...new Set(data.map((d) => d.type))];

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={AXES.map((a) => ({ id: a.id, label: a.label }))} defaultTab={axisId} onChange={setAxisId} />
      </div>
      <ChartWrapper height={400}>
        <ScatterChart margin={{ bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis type="number" dataKey="x" name={axis.xLabel} fontSize={11} />
          <YAxis type="number" dataKey="y" name={axis.yLabel} fontSize={11} />
          <ZAxis type="number" dataKey="z" range={[20, 300]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-500">{d?.type}</p>
                  <p className="text-rinfo-600">{axis.xLabel}: {d?.x}</p>
                  <p className="text-rinfo-600">{axis.yLabel}: {d?.y}</p>
                  <p className="text-rinfo-600">재학생: {d?.z?.toLocaleString()}명</p>
                </div>
              );
            }}
          />
          {types.map((type) => (
            <Scatter
              key={type}
              name={type}
              data={data.filter((d) => d.type === type)}
              fill={TYPE_COLORS[type] || "#999"}
              fillOpacity={0.6}
            />
          ))}
        </ScatterChart>
      </ChartWrapper>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-rinfo-600">
        {types.map((type) => (
          <span key={type} className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLORS[type] || "#999" }} />
            {type}
          </span>
        ))}
      </div>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        도서관에 투자한 자원(예산, 직원, 시설)이 실제 이용(대출, 방문)으로 이어지는지 보여주는 차트입니다. 오른쪽 위에 있는 대학은 투입도 많고 성과도 높으며, 색상으로 설립유형을 구분할 수 있습니다.
      </p>
    </div>
  );
}

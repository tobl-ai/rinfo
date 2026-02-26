"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const VIEWS = [
  { id: "type", label: "설립유형별" },
  { id: "size", label: "규모별" },
  { id: "category", label: "학교유형별" },
];

function groupBy(universities: University[], key: "type" | "size" | "category") {
  const groups: Record<string, University[]> = {};
  for (const u of universities) {
    const k = u[key] || "기타";
    if (!groups[k]) groups[k] = [];
    groups[k].push(u);
  }
  return groups;
}

function computeBudgetBreakdown(unis: University[]) {
  let domestic = 0, foreign = 0, ejDom = 0, ejFor = 0, webDb = 0;
  for (const u of unis) {
    domestic += u.budget.domesticBooks;
    foreign += u.budget.foreignBooks;
    ejDom += u.budget.ejournalDomestic;
    ejFor += u.budget.ejournalForeign;
    webDb += u.budget.webDbDomestic + u.budget.webDbForeign;
  }
  const div = 1_0000_0000;
  return {
    국내도서: Math.round(domestic / div),
    국외도서: Math.round(foreign / div),
    전자저널: Math.round((ejDom + ejFor) / div),
    웹DB: Math.round(webDb / div),
  };
}

export function BudgetCompositionChart({ universities }: Props) {
  const [view, setView] = useState("type");
  const key = view as "type" | "size" | "category";
  const groups = groupBy(universities, key);

  const data = Object.entries(groups).map(([name, unis]) => ({
    name,
    ...computeBudgetBreakdown(unis),
  }));

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={VIEWS} defaultTab={view} onChange={setView} />
      </div>
      <ChartWrapper height={400}>
        <BarChart data={data} margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis dataKey="name" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="mb-1 font-semibold text-rinfo-800">{label}</p>
                  {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color }} className="text-rinfo-600">
                      {p.name}: {Number(p.value).toLocaleString()}억원
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend />
          <Bar dataKey="국내도서" stackId="a" fill="#b85213" />
          <Bar dataKey="국외도서" stackId="a" fill="#f58d3d" />
          <Bar dataKey="전자저널" stackId="a" fill="#4a90d9" />
          <Bar dataKey="웹DB" stackId="a" fill="#5bba6f" />
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        자료구입비를 국내도서, 국외도서, 전자저널, 웹DB 네 가지로 나눠서 보여줍니다. 탭을 전환하면 설립유형, 규모, 학교유형별 비교가 가능합니다. 전자저널과 웹DB 비중이 높은 그룹은 디지털 전환이 더 진행된 것으로 볼 수 있습니다.
      </p>
    </div>
  );
}

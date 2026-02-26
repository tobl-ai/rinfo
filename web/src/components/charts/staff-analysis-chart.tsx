"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const VIEWS = [
  { id: "ratio", label: "사서 비율" },
  { id: "per1000", label: "1,000명당" },
  { id: "fulltime", label: "정규직 비율" },
];

function groupAvg(universities: University[], key: "type" | "size") {
  const groups: Record<string, University[]> = {};
  for (const u of universities) {
    const k = u[key] || "기타";
    if (!groups[k]) groups[k] = [];
    groups[k].push(u);
  }
  return groups;
}

export function StaffAnalysisChart({ universities }: Props) {
  const [view, setView] = useState("ratio");
  const groups = groupAvg(universities, "type");

  const data = Object.entries(groups).map(([name, unis]) => {
    const totalStaff = unis.reduce((s, u) => s + u.staff.totalStaff, 0);
    const librarians = unis.reduce((s, u) => s + u.staff.librarians, 0);
    const avgPer1000 = unis.reduce((s, u) => s + u.indicators.staffPer1000, 0) / unis.length;
    const avgFulltime = unis.reduce((s, u) => s + u.staff.fullTimeRatio, 0) / unis.length;
    return {
      name,
      사서: librarians,
      기타직원: totalStaff - librarians,
      사서비율: totalStaff > 0 ? Math.round((librarians / totalStaff) * 1000) / 10 : 0,
      "1000명당직원": Math.round(avgPer1000 * 10) / 10,
      정규직비율: Math.round(avgFulltime * 10) / 10,
    };
  });

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={VIEWS} defaultTab={view} onChange={setView} />
      </div>
      <ChartWrapper height={350}>
        {view === "ratio" ? (
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
                      <p key={p.name} style={{ color: p.color }}>
                        {p.name}: {Number(p.value).toLocaleString()}명
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="사서" stackId="a" fill="#f47721" />
            <Bar dataKey="기타직원" stackId="a" fill="#ffe0c0" />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} unit={view === "per1000" ? "명" : "%"} />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                const d = payload[0]?.payload;
                const val = view === "per1000" ? d?.["1000명당직원"] : d?.정규직비율;
                const unit = view === "per1000" ? "명" : "%";
                return (
                  <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                    <p className="font-semibold text-rinfo-800">{label}</p>
                    <p className="text-rinfo-600">{val}{unit}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey={view === "per1000" ? "1000명당직원" : "정규직비율"} radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={["#b85213", "#f47721", "#4a90d9", "#5bba6f"][i % 4]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        설립유형별 도서관 인력 현황입니다. &quot;사서 비율&quot; 탭은 전체 직원 중 전문 사서 비중을, &quot;1,000명당&quot; 탭은 재학생 규모 대비 직원 수를, &quot;정규직 비율&quot; 탭은 고용 안정성을 보여줍니다.
      </p>
    </div>
  );
}

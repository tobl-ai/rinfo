"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const METRICS = [
  { id: "homepage", label: "홈페이지", fn: (u: University) => u.eService.homepageVisits, unit: "만 건", divisor: 10000 },
  { id: "opac", label: "OPAC 검색", fn: (u: University) => u.eService.opacSearches, unit: "만 건", divisor: 10000 },
  { id: "dbSearch", label: "DB 검색", fn: (u: University) => u.eService.dbSearches, unit: "만 건", divisor: 10000 },
  { id: "download", label: "전문 다운로드", fn: (u: University) => u.eService.dbDownloadsFulltext, unit: "만 건", divisor: 10000 },
];

const COLORS = [
  "#b85213", "#d96518", "#f47721", "#f58d3d", "#ffb36e",
  "#ffc48a", "#ffd4aa", "#ffe0c0", "#ffe8d0", "#fff0e0",
];

export function EserviceChart({ universities }: Props) {
  const [metricId, setMetricId] = useState("homepage");
  const metric = METRICS.find((m) => m.id === metricId) || METRICS[0];

  const data = [...universities]
    .sort((a, b) => metric.fn(b) - metric.fn(a))
    .slice(0, 10)
    .map((u) => ({
      name: u.name.length > 10 ? u.name.slice(0, 10) + "…" : u.name,
      fullName: u.name,
      value: Math.round((metric.fn(u) / metric.divisor) * 10) / 10,
    }));

  return (
    <div>
      <div className="mb-3">
        <Tabs tabs={METRICS.map((m) => ({ id: m.id, label: m.label }))} defaultTab={metricId} onChange={setMetricId} />
      </div>
      <ChartWrapper height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" horizontal={false} />
          <XAxis type="number" fontSize={11} />
          <YAxis type="category" dataKey="name" width={100} fontSize={11} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.fullName}</p>
                  <p className="text-rinfo-600">{d?.value} {metric.unit}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        온라인 도서관 서비스를 가장 활발하게 제공하는 상위 10개 대학입니다. 탭을 바꾸면 홈페이지 방문, 목록 검색(OPAC), 데이터베이스 검색, 전문 다운로드 각각의 순위를 확인할 수 있습니다.
      </p>
    </div>
  );
}

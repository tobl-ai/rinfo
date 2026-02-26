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
  "#3d7a28", "#4a8530", "#5b9a3c", "#6aad2d", "#8dc63f",
  "#9ad04e", "#a8d96a", "#b8dfaa", "#c5e8b8", "#d2efc8",
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
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" horizontal={false} />
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
    </div>
  );
}

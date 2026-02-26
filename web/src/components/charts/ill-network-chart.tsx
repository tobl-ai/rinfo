"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function IllNetworkChart({ universities }: Props) {
  const data = [...universities]
    .filter((u) => u.usage.illRequests + u.usage.illProvided > 0)
    .sort((a, b) => (b.usage.illRequests + b.usage.illProvided) - (a.usage.illRequests + a.usage.illProvided))
    .slice(0, 15)
    .map((u) => ({
      name: u.name.length > 8 ? u.name.slice(0, 8) + "…" : u.name,
      fullName: u.name,
      신청: u.usage.illRequests,
      제공: u.usage.illProvided,
      ratio: u.usage.illProvided > 0
        ? Math.round((u.usage.illRequests / u.usage.illProvided) * 100) / 100
        : 0,
    }));

  return (
    <div>
      <p className="mb-2 text-xs text-rinfo-500">
        상호대차 활동이 활발한 상위 15개 대학 (신청 + 제공 기준)
      </p>
      <ChartWrapper height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" horizontal={false} />
          <XAxis type="number" fontSize={11} />
          <YAxis type="category" dataKey="name" width={85} fontSize={10} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.fullName}</p>
                  <p className="text-rinfo-600">신청: {d?.신청?.toLocaleString()}건</p>
                  <p className="text-rinfo-600">제공: {d?.제공?.toLocaleString()}건</p>
                  <p className="text-rinfo-600">신청/제공 비율: {d?.ratio}</p>
                </div>
              );
            }}
          />
          <Legend />
          <Bar dataKey="신청" stackId="a" fill="#5bacd8" />
          <Bar dataKey="제공" stackId="a" fill="#5b9a3c" />
        </BarChart>
      </ChartWrapper>
    </div>
  );
}

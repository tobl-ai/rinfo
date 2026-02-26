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
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" horizontal={false} />
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
          <Bar dataKey="신청" stackId="a" fill="#4a90d9" />
          <Bar dataKey="제공" stackId="a" fill="#f47721" />
        </BarChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        상호대차는 다른 도서관의 자료를 빌려주거나 빌려오는 서비스입니다. &quot;신청&quot;은 다른 도서관에 요청한 건수, &quot;제공&quot;은 다른 도서관에 빌려준 건수입니다. 제공이 많은 대학은 장서가 풍부하여 다른 대학에 기여하는 도서관입니다.
      </p>
    </div>
  );
}

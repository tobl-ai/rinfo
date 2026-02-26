"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function DigitalAdoptionChart({ universities }: Props) {
  const data = universities
    .filter((u) => u.budget.materialBudgetTotal > 0 && u.studentsCurrYear > 0)
    .map((u) => {
      const digitalRatio = u.budget.digitalTotal / Math.max(u.budget.materialBudgetTotal, 1) * 100;
      const dbPerStudent = (u.eService.dbDownloadsFulltext + u.eService.dbDownloadsDataset) / u.studentsCurrYear;
      return {
        name: u.name,
        type: u.type,
        x: Math.round(digitalRatio * 10) / 10,
        y: Math.round(dbPerStudent * 10) / 10,
        z: u.budget.digitalTotal / 1_0000_0000,
      };
    })
    .filter((d) => d.x > 0 && d.y > 0 && isFinite(d.x) && isFinite(d.y));

  return (
    <div>
      <p className="mb-2 text-xs text-rinfo-500">
        X축: 전자자료 구입비 비율(%) / Y축: 1인당 DB 다운로드 건수 / 크기: 전자자료 총액
      </p>
      <ChartWrapper height={400}>
        <ScatterChart margin={{ bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcefd3" />
          <XAxis type="number" dataKey="x" name="전자자료 비율" unit="%" fontSize={11} />
          <YAxis type="number" dataKey="y" name="1인당 다운로드" fontSize={11} />
          <ZAxis type="number" dataKey="z" range={[20, 400]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-500">{d?.type}</p>
                  <p className="text-rinfo-600">전자자료 비율: {d?.x}%</p>
                  <p className="text-rinfo-600">1인당 다운로드: {d?.y}건</p>
                  <p className="text-rinfo-600">전자자료 예산: {Math.round(d?.z * 10) / 10}억원</p>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#5bacd8" fillOpacity={0.6} />
        </ScatterChart>
      </ChartWrapper>
    </div>
  );
}

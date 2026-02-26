"use client";

import { useMemo } from "react";
import Link from "next/link";
import { zScores } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const INDICATORS = [
  { id: "booksPerStudent", label: "1인당 장서", fn: (u: University) => u.indicators.booksPerStudent, unit: "권" },
  { id: "budgetPerStudent", label: "1인당 예산", fn: (u: University) => u.indicators.budgetPerStudent, unit: "원" },
  { id: "loansPerStudent", label: "1인당 대출", fn: (u: University) => u.indicators.loansPerStudent, unit: "권" },
  { id: "staffPer1000", label: "1000명당직원", fn: (u: University) => u.indicators.staffPer1000, unit: "명" },
  { id: "borrowerRatio", label: "대출자비율", fn: (u: University) => u.indicators.borrowerRatio, unit: "%" },
  { id: "digitalBudgetRatio", label: "전자자료비율", fn: (u: University) => u.indicators.digitalBudgetRatio, unit: "%" },
];

interface OutlierRow {
  university: University;
  indicator: string;
  value: number;
  unit: string;
  z: number;
  direction: "high" | "low";
}

export function OutlierTable({ universities }: Props) {
  const { outliers, narrative } = useMemo(() => {
    const active = universities.filter((u) => u.studentsCurrYear > 0);
    const rows: OutlierRow[] = [];

    for (const ind of INDICATORS) {
      const values = active.map(ind.fn);
      const zs = zScores(values);
      for (let i = 0; i < active.length; i++) {
        if (Math.abs(zs[i]) >= 2.5) {
          rows.push({
            university: active[i],
            indicator: ind.label,
            value: Math.round(values[i] * 100) / 100,
            unit: ind.unit,
            z: Math.round(zs[i] * 100) / 100,
            direction: zs[i] > 0 ? "high" : "low",
          });
        }
      }
    }

    rows.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));

    const highCount = rows.filter((r) => r.direction === "high").length;
    const lowCount = rows.filter((r) => r.direction === "low").length;
    const uniqueUnis = new Set(rows.map((r) => r.university.id)).size;

    const n = `Z-score 기준(|z| ≥ 2.5)으로 ${rows.length}건의 이상치가 탐지되었으며, ` +
      `${uniqueUnis}개 대학에서 발견되었습니다. ` +
      `상향 이상치 ${highCount}건, 하향 이상치 ${lowCount}건입니다. ` +
      `이상치는 데이터 입력 오류일 수 있으나, 해당 대학의 특수한 환경(예: 소규모 특수대학, 대형 종합대학)을 반영하는 경우가 많습니다.`;

    return { outliers: rows.slice(0, 30), narrative: n };
  }, [universities]);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-rinfo-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-rinfo-100 bg-rinfo-50/60">
              <th className="px-3 py-2.5 text-left font-semibold text-rinfo-800">대학</th>
              <th className="px-3 py-2.5 text-left font-semibold text-rinfo-800">유형</th>
              <th className="px-3 py-2.5 text-left font-semibold text-rinfo-800">지표</th>
              <th className="px-3 py-2.5 text-right font-semibold text-rinfo-800">값</th>
              <th className="px-3 py-2.5 text-right font-semibold text-rinfo-800">Z-score</th>
              <th className="px-3 py-2.5 text-center font-semibold text-rinfo-800">방향</th>
            </tr>
          </thead>
          <tbody>
            {outliers.map((row, i) => (
              <tr key={`${row.university.id}-${row.indicator}-${i}`} className="border-b border-rinfo-50 hover:bg-rinfo-50/40">
                <td className="px-3 py-2">
                  <Link href={`/universities/${row.university.id}`} className="font-medium text-rinfo-600 hover:text-rinfo-800 hover:underline">
                    {row.university.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-rinfo-500">{row.university.type} · {row.university.size}</td>
                <td className="px-3 py-2 text-rinfo-700">{row.indicator}</td>
                <td className="px-3 py-2 text-right font-mono text-rinfo-700">
                  {row.value.toLocaleString()}{row.unit}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: row.direction === "high" ? "#e74c3c" : "#3498db" }}>
                  {row.z > 0 ? "+" : ""}{row.z.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    row.direction === "high" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {row.direction === "high" ? "▲ 상향" : "▼ 하향"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

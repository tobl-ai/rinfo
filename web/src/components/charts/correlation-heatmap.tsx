"use client";

import { useMemo } from "react";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const VARS = [
  { id: "books", label: "1인당도서", fn: (u: University) => u.indicators.booksPerStudent },
  { id: "budget", label: "1인당예산", fn: (u: University) => u.indicators.budgetPerStudent },
  { id: "loans", label: "1인당대출", fn: (u: University) => u.indicators.loansPerStudent },
  { id: "area", label: "1인당면적", fn: (u: University) => u.indicators.areaPerStudent },
  { id: "staff", label: "1000명당직원", fn: (u: University) => u.indicators.staffPer1000 },
  { id: "digital", label: "전자자료비율", fn: (u: University) => u.indicators.digitalBudgetRatio },
  { id: "borrower", label: "대출자비율", fn: (u: University) => u.indicators.borrowerRatio },
];

function pearson(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = xs[i] - mx;
    const yi = ys[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

function corrColor(r: number) {
  if (r >= 0.7) return "bg-green-600 text-white";
  if (r >= 0.4) return "bg-green-300 text-green-900";
  if (r >= 0.1) return "bg-green-100 text-green-800";
  if (r >= -0.1) return "bg-gray-100 text-gray-600";
  if (r >= -0.4) return "bg-red-100 text-red-800";
  if (r >= -0.7) return "bg-red-300 text-red-900";
  return "bg-red-600 text-white";
}

export function CorrelationHeatmap({ universities }: Props) {
  const matrix = useMemo(() => {
    const active = universities.filter((u) => u.studentsCurrYear > 0);
    const vectors = VARS.map((v) => active.map(v.fn).filter((x) => isFinite(x)));

    const result: number[][] = [];
    for (let i = 0; i < VARS.length; i++) {
      result[i] = [];
      for (let j = 0; j < VARS.length; j++) {
        if (i === j) {
          result[i][j] = 1;
        } else {
          const pairs = active
            .map((_, k) => [vectors[i][k], vectors[j][k]])
            .filter(([a, b]) => isFinite(a) && isFinite(b));
          result[i][j] = pearson(pairs.map((p) => p[0]), pairs.map((p) => p[1]));
        }
      }
    }
    return result;
  }, [universities]);

  return (
    <div className="overflow-x-auto rounded-xl border border-rinfo-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs text-rinfo-500">주요 지표 간 피어슨 상관계수 (426개 대학 기준)</p>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-left text-rinfo-700" />
            {VARS.map((v) => (
              <th key={v.id} className="px-2 py-1.5 text-center text-rinfo-700 font-medium">
                {v.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VARS.map((row, i) => (
            <tr key={row.id}>
              <td className="px-2 py-1.5 font-medium text-rinfo-700">{row.label}</td>
              {VARS.map((_, j) => {
                const r = matrix[i]?.[j] ?? 0;
                return (
                  <td
                    key={j}
                    className={`px-2 py-1.5 text-center font-mono ${corrColor(r)}`}
                  >
                    {r.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-rinfo-500">
        <span>강한 음의 상관</span>
        <span className="inline-block h-3 w-3 rounded bg-red-600" />
        <span className="inline-block h-3 w-3 rounded bg-red-300" />
        <span className="inline-block h-3 w-3 rounded bg-red-100" />
        <span className="inline-block h-3 w-3 rounded bg-gray-100" />
        <span className="inline-block h-3 w-3 rounded bg-green-100" />
        <span className="inline-block h-3 w-3 rounded bg-green-300" />
        <span className="inline-block h-3 w-3 rounded bg-green-600" />
        <span>강한 양의 상관</span>
      </div>
    </div>
  );
}

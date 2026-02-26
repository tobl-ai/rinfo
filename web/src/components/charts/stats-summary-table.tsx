"use client";

import { useMemo } from "react";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

interface StatRow {
  label: string;
  values: number[];
  unit: string;
  format: (n: number) => string;
}

function pct(vals: number[], p: number) {
  const sorted = [...vals].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * p)] ?? 0;
}

export function StatsSummaryTable({ universities }: Props) {
  const rows: StatRow[] = useMemo(() => {
    const active = universities.filter((u) => u.studentsCurrYear > 0);
    const fmt0 = (n: number) => Math.round(n).toLocaleString();
    const fmt1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString();

    return [
      {
        label: "소장 도서(권)",
        values: active.map((u) => u.collection.totalBooks),
        unit: "권", format: fmt0,
      },
      {
        label: "1인당 도서(권)",
        values: active.map((u) => u.indicators.booksPerStudent),
        unit: "권", format: fmt1,
      },
      {
        label: "자료구입비(만원)",
        values: active.map((u) => u.budget.materialBudgetTotal / 10000),
        unit: "만원", format: fmt0,
      },
      {
        label: "1인당 자료구입비(원)",
        values: active.map((u) => u.indicators.budgetPerStudent),
        unit: "원", format: fmt0,
      },
      {
        label: "대출 책수(권)",
        values: active.map((u) => u.usage.loanBooks),
        unit: "권", format: fmt0,
      },
      {
        label: "1인당 대출(권)",
        values: active.map((u) => u.indicators.loansPerStudent),
        unit: "권", format: fmt1,
      },
      {
        label: "이용자 수(명)",
        values: active.map((u) => u.usage.visitors),
        unit: "명", format: fmt0,
      },
      {
        label: "전자자료 비율(%)",
        values: active
          .filter((u) => u.budget.materialBudgetTotal > 0)
          .map((u) => (u.budget.digitalTotal / u.budget.materialBudgetTotal) * 100),
        unit: "%", format: fmt1,
      },
      {
        label: "대출자 비율(%)",
        values: active.map((u) => u.indicators.borrowerRatio),
        unit: "%", format: fmt1,
      },
      {
        label: "열람석 수",
        values: active.map((u) => u.facilities.seats),
        unit: "석", format: fmt0,
      },
    ];
  }, [universities]);

  return (
    <div className="overflow-x-auto rounded-xl border border-rinfo-200 bg-white shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-rinfo-100 bg-rinfo-50/60">
            <th className="px-3 py-2.5 text-left font-semibold text-rinfo-800">지표</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-800">평균</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-800">중앙값</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-600">하위 25%</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-600">상위 25%</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-600">상위 10%</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-400">최솟값</th>
            <th className="px-3 py-2.5 text-right font-semibold text-rinfo-400">최댓값</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const vals = row.values.filter((v) => isFinite(v));
            if (!vals.length) return null;
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            return (
              <tr key={row.label} className="border-b border-rinfo-50 hover:bg-rinfo-50/40">
                <td className="px-3 py-2 font-medium text-rinfo-700">{row.label}</td>
                <td className="px-3 py-2 text-right font-semibold text-rinfo-800">{row.format(mean)}</td>
                <td className="px-3 py-2 text-right text-rinfo-700">{row.format(pct(vals, 0.5))}</td>
                <td className="px-3 py-2 text-right text-rinfo-500">{row.format(pct(vals, 0.25))}</td>
                <td className="px-3 py-2 text-right text-rinfo-500">{row.format(pct(vals, 0.75))}</td>
                <td className="px-3 py-2 text-right text-rinfo-500">{row.format(pct(vals, 0.9))}</td>
                <td className="px-3 py-2 text-right text-rinfo-400">{row.format(Math.min(...vals))}</td>
                <td className="px-3 py-2 text-right text-rinfo-400">{row.format(Math.max(...vals))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getUniversities } from "@/lib/data";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import { CompareRadar } from "@/components/charts/compare-radar";
import { Section } from "@/components/ui/section";
import type { University } from "@/types/university";

const MAX_COMPARE = 5;

export default function ComparePage() {
  const allUniversities = useMemo(() => getUniversities(), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => allUniversities.filter((u) => selectedIds.includes(u.id)),
    [allUniversities, selectedIds]
  );

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return allUniversities
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) && !selectedIds.includes(u.id)
      )
      .slice(0, 10);
  }, [allUniversities, search, selectedIds]);

  const addUniversity = (id: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
      setSearch("");
    }
  };

  const removeUniversity = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  return (
    <div className="min-h-screen bg-rinfo-50/40">
      <header className="border-b border-rinfo-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="text-sm text-rinfo-600 hover:text-rinfo-800 hover:underline">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            대학 비교
          </h1>
          <p className="text-sm text-gray-500">
            최대 {MAX_COMPARE}개 대학을 선택하여 비교
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="rounded-xl border border-rinfo-200/60 bg-white p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="대학 검색 후 선택..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-rinfo-200 px-4 py-2 text-sm focus:border-rinfo-500 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-rinfo-200/60 bg-white shadow-lg">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addUniversity(u.id)}
                    className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-rinfo-50"
                  >
                    <span>{u.name}</span>
                    <span className="text-xs text-gray-400">
                      {u.type} · {u.category} · {u.size}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((u, i) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white"
                style={{
                  backgroundColor: [
                    "#f47721",
                    "#5bba6f",
                    "#4a90d9",
                    "#ffb36e",
                    "#b85213",
                  ][i],
                }}
              >
                {u.name}
                <button
                  onClick={() => removeUniversity(u.id)}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            ))}
            {selected.length === 0 && (
              <p className="text-sm text-gray-400">
                대학을 검색하여 추가하세요
              </p>
            )}
          </div>
        </div>

        {selected.length >= 2 && (
          <>
            <Section title="주요 지표 비교 레이더">
              <CompareRadar universities={selected} />
            </Section>
            <Section title="비교 테이블">
              <CompareTable universities={selected} />
            </Section>
          </>
        )}

        {selected.length === 1 && (
          <p className="text-center text-sm text-gray-400">
            비교를 위해 2개 이상의 대학을 선택하세요
          </p>
        )}
      </main>

      <footer className="border-t border-rinfo-200 bg-white py-6 text-center text-sm text-rinfo-600">
        데이터 출처: KERIS 2025년 대학도서관 실태조사
        <br />
        <a href="https://github.com/tobl-ai" className="mt-1 inline-block text-xs text-gray-400 hover:text-rinfo-500" target="_blank" rel="noopener noreferrer">tobl.ai</a>
      </footer>
    </div>
  );
}

function CompareTable({ universities }: { universities: University[] }) {
  const rows: { label: string; values: string[] }[] = [
    {
      label: "재학생 수",
      values: universities.map((u) => formatNumber(u.studentsCurrYear) + "명"),
    },
    {
      label: "소장 도서",
      values: universities.map(
        (u) => formatNumber(u.collection.totalBooks) + "권"
      ),
    },
    {
      label: "1인당 도서",
      values: universities.map((u) => u.indicators.booksPerStudent + "권"),
    },
    {
      label: "자료구입비",
      values: universities.map((u) =>
        formatCurrency(u.budget.materialBudgetTotal)
      ),
    },
    {
      label: "1인당 자료구입비",
      values: universities.map((u) =>
        formatCurrency(u.indicators.budgetPerStudent)
      ),
    },
    {
      label: "전자자료 비율",
      values: universities.map((u) =>
        formatPercent(u.indicators.digitalBudgetRatio)
      ),
    },
    {
      label: "이용자 수",
      values: universities.map((u) => formatNumber(u.usage.visitors) + "명"),
    },
    {
      label: "대출 책수",
      values: universities.map(
        (u) => formatNumber(u.usage.loanBooks) + "권"
      ),
    },
    {
      label: "1인당 대출",
      values: universities.map((u) => u.indicators.loansPerStudent + "권"),
    },
    {
      label: "대출자 비율",
      values: universities.map((u) =>
        formatPercent(u.indicators.borrowerRatio)
      ),
    },
    {
      label: "건물 면적",
      values: universities.map(
        (u) => formatNumber(u.facilities.buildingArea) + "㎡"
      ),
    },
    {
      label: "열람석 수",
      values: universities.map(
        (u) => formatNumber(u.facilities.seats) + "석"
      ),
    },
    {
      label: "직원 수",
      values: universities.map((u) => u.staff.totalStaff + "명"),
    },
    {
      label: "사서 수",
      values: universities.map((u) => u.staff.librarians + "명"),
    },
  ];

  const colors = ["#f47721", "#5bba6f", "#4a90d9", "#ffb36e", "#b85213"];

  return (
    <div className="overflow-x-auto rounded-xl border border-rinfo-200/60">
      <table className="w-full text-sm">
        <thead className="bg-rinfo-50/40">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              지표
            </th>
            {universities.map((u, i) => (
              <th
                key={u.id}
                className="px-4 py-3 text-right text-xs font-medium"
                style={{ color: colors[i] }}
              >
                {u.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-rinfo-50/40">
              <td className="px-4 py-3 font-medium text-gray-700">
                {row.label}
              </td>
              {row.values.map((v, i) => (
                <td key={i} className="px-4 py-3 text-right text-gray-900">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

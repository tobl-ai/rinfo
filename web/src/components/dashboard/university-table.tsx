"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import type { University } from "@/types/university";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface Props {
  universities: University[];
}

type SortKey =
  | "name"
  | "studentsCurrYear"
  | "totalBooks"
  | "budgetPerStudent"
  | "loansPerStudent"
  | "booksPerStudent";

export function UniversityTable({ universities }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const types = useMemo(
    () => [...new Set(universities.map((u) => u.type).filter(Boolean))],
    [universities]
  );
  const categories = useMemo(
    () => [...new Set(universities.map((u) => u.category).filter(Boolean))],
    [universities]
  );
  const sizes = useMemo(
    () => [...new Set(universities.map((u) => u.size).filter(Boolean))],
    [universities]
  );

  const filtered = useMemo(() => {
    let result = universities;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q));
    }
    if (typeFilter) result = result.filter((u) => u.type === typeFilter);
    if (categoryFilter) result = result.filter((u) => u.category === categoryFilter);
    if (sizeFilter) result = result.filter((u) => u.size === sizeFilter);
    return result;
  }, [universities, search, typeFilter, categoryFilter, sizeFilter]);

  const sorted = useMemo(() => {
    const getValue = (u: University): string | number => {
      switch (sortKey) {
        case "name": return u.name;
        case "studentsCurrYear": return u.studentsCurrYear;
        case "totalBooks": return u.collection.totalBooks;
        case "budgetPerStudent": return u.indicators.budgetPerStudent;
        case "loansPerStudent": return u.indicators.loansPerStudent;
        case "booksPerStudent": return u.indicators.booksPerStudent;
      }
    };
    return [...filtered].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  useEffect(() => {
    setVisibleCount(50);
  }, [search, typeFilter, categoryFilter, sizeFilter, sortKey, sortAsc]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 50, sorted.length));
  }, [sorted.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "name"); }
  };

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="대학 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-rinfo-200 px-3 py-2 text-sm focus:border-rinfo-500 focus:outline-none"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-rinfo-200 px-3 py-2 text-sm"
        >
          <option value="">설립주체 전체</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-rinfo-200 px-3 py-2 text-sm"
        >
          <option value="">유형 전체</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="rounded-lg border border-rinfo-200 px-3 py-2 text-sm"
        >
          <option value="">규모 전체</option>
          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="self-center text-sm text-gray-500">
          {sorted.length}개 대학
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-rinfo-200/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-rinfo-50 text-xs uppercase text-rinfo-700">
            <tr>
              <Th onClick={() => handleSort("name")}>
                대학명{sortIcon("name")}
              </Th>
              <Th className="text-center">유형</Th>
              <Th className="text-center">설립</Th>
              <Th className="text-center">규모</Th>
              <Th onClick={() => handleSort("studentsCurrYear")} className="text-right">
                재학생{sortIcon("studentsCurrYear")}
              </Th>
              <Th onClick={() => handleSort("totalBooks")} className="text-right">
                소장도서{sortIcon("totalBooks")}
              </Th>
              <Th onClick={() => handleSort("booksPerStudent")} className="text-right">
                1인당 도서{sortIcon("booksPerStudent")}
              </Th>
              <Th onClick={() => handleSort("budgetPerStudent")} className="text-right">
                1인당 예산{sortIcon("budgetPerStudent")}
              </Th>
              <Th onClick={() => handleSort("loansPerStudent")} className="text-right">
                1인당 대출{sortIcon("loansPerStudent")}
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, visibleCount).map((u) => (
              <tr key={u.id} className="hover:bg-rinfo-50">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/universities/${u.id}`}
                    className="text-rinfo-600 hover:text-rinfo-800 hover:underline"
                  >
                    {u.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{u.category}</td>
                <td className="px-4 py-3 text-center text-gray-500">{u.type}</td>
                <td className="px-4 py-3 text-center text-gray-500">{u.size}</td>
                <td className="px-4 py-3 text-right">{formatNumber(u.studentsCurrYear)}</td>
                <td className="px-4 py-3 text-right">{formatNumber(u.collection.totalBooks)}</td>
                <td className="px-4 py-3 text-right">{u.indicators.booksPerStudent}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(u.indicators.budgetPerStudent)}</td>
                <td className="px-4 py-3 text-right">{u.indicators.loansPerStudent}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleCount < sorted.length && (
          <div ref={sentinelRef} className="p-4 text-center text-sm text-rinfo-400">
            {sorted.length - visibleCount}개 더 불러오는 중...
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 ${onClick ? "cursor-pointer hover:text-rinfo-500" : ""} ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

import Link from "next/link";
import { getUniversities, getSummary } from "@/lib/data";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { UniversityTable } from "@/components/dashboard/university-table";
import { Section } from "@/components/ui/section";

export default function Home() {
  const universities = getUniversities();
  const summary = getSummary();

  return (
    <div className="min-h-screen bg-rinfo-50/40">
      <header className="border-b border-rinfo-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rinfo-500">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-rinfo-900">
                Rinfo 대학도서관 통계
              </h1>
              <p className="text-xs text-rinfo-600">
                2025년 대학도서관 실태조사 결과 (426개 대학)
              </p>
            </div>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link
              href="/compare"
              className="rounded-lg bg-rinfo-500 px-4 py-2 font-medium text-white transition-colors hover:bg-rinfo-600"
            >
              대학 비교
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <KpiSection summary={summary} />
        <ChartsSection universities={universities} />
        <Section title="대학 목록">
          <UniversityTable universities={universities} />
        </Section>
      </main>

      <footer className="border-t border-rinfo-200 bg-white py-6 text-center text-sm text-rinfo-600">
        데이터 출처: KERIS 2025년 대학도서관 실태조사 (2024.03.01~2025.02.28)
        <br />
        <a
          href="https://github.com/tobl-ai"
          className="mt-1 inline-block text-xs text-gray-400 hover:text-rinfo-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          tobl.ai
        </a>
      </footer>
    </div>
  );
}

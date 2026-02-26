import Link from "next/link";
import { notFound } from "next/navigation";
import { getUniversities, getUniversityById } from "@/lib/data";
import { computeAverages, getRankInGroup } from "@/lib/stats";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import { KpiCard } from "@/components/ui/kpi-card";
import { UniversityRadar } from "@/components/charts/university-radar";
import { Section } from "@/components/ui/section";

export function generateStaticParams() {
  return getUniversities().map((u) => ({ id: u.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UniversityDetailPage({ params }: Props) {
  const { id } = await params;
  const university = getUniversityById(id);
  if (!university) notFound();

  const all = getUniversities();
  const averages = computeAverages(all);
  const sameSize = all.filter((u) => u.size === university.size);
  const sameType = all.filter((u) => u.type === university.type);

  const booksRank = getRankInGroup(university, sameSize, (u) => u.indicators.booksPerStudent);
  const budgetRank = getRankInGroup(university, sameType, (u) => u.indicators.budgetPerStudent);

  return (
    <div className="min-h-screen bg-rinfo-50/40">
      <header className="border-b border-rinfo-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/" className="text-sm text-rinfo-600 hover:text-rinfo-800 hover:underline">
            ← 대시보드로 돌아가기
          </Link>
          <div className="mt-2 flex items-baseline gap-4">
            <h1 className="text-2xl font-bold text-rinfo-900">{university.name}</h1>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-rinfo-100 px-2.5 py-0.5 text-rinfo-700">
                {university.type}
              </span>
              <span className="rounded-full bg-sky-r-100 px-2.5 py-0.5 text-sky-r-500">
                {university.category}
              </span>
              <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-accent-500">
                {university.size}규모
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard title="재학생 수" value={formatNumber(university.studentsCurrYear) + "명"} />
          <KpiCard
            title="소장 도서"
            value={formatNumber(university.collection.totalBooks) + "권"}
            subtitle={`1인당 ${university.indicators.booksPerStudent}권`}
          />
          <KpiCard
            title="자료구입비"
            value={formatCurrency(university.budget.materialBudgetTotal)}
            subtitle={`1인당 ${formatCurrency(university.indicators.budgetPerStudent)}`}
          />
          <KpiCard title="이용자 수" value={formatNumber(university.usage.visitors) + "명"} />
          <KpiCard
            title="대출 책수"
            value={formatNumber(university.usage.loanBooks) + "권"}
            subtitle={`1인당 ${university.indicators.loansPerStudent}권`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="전체 평균 대비 주요 지표">
            <UniversityRadar university={university} averages={averages} />
          </Section>

          <Section title="순위 정보">
            <div className="space-y-4 rounded-xl border border-rinfo-200/60 bg-white p-6">
              <RankItem
                label={`${university.size}규모 내 1인당 도서 수`}
                rank={booksRank.rank}
                total={booksRank.total}
              />
              <RankItem
                label={`${university.type} 내 1인당 자료구입비`}
                rank={budgetRank.rank}
                total={budgetRank.total}
              />
              <div className="mt-6 border-t border-rinfo-100 pt-4">
                <h3 className="mb-3 text-sm font-semibold text-rinfo-700">상세 지표</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="건물 면적" value={`${formatNumber(university.facilities.buildingArea)}㎡`} />
                  <Stat label="열람석" value={`${formatNumber(university.facilities.seats)}석`} />
                  <Stat label="직원 수" value={`${university.staff.totalStaff}명`} />
                  <Stat label="사서 수" value={`${university.staff.librarians}명`} />
                  <Stat label="정규직 비율" value={formatPercent(university.staff.fullTimeRatio)} />
                  <Stat label="대출자 비율" value={formatPercent(university.indicators.borrowerRatio)} />
                  <Stat label="전자자료 비율" value={formatPercent(university.indicators.digitalBudgetRatio)} />
                  <Stat label="상호대차 신청" value={`${formatNumber(university.usage.illRequests)}건`} />
                </div>
              </div>
            </div>
          </Section>
        </div>

        <Section title="소장자료 상세">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DetailCard label="국내서" value={formatNumber(university.collection.domestic.total) + "권"} />
            <DetailCard label="국외서" value={formatNumber(university.collection.foreign.total) + "권"} />
            <DetailCard label="e-Book" value={formatNumber(university.collection.ebooks) + "권"} />
            <DetailCard label="비도서자료" value={formatNumber(university.collection.nonBookMaterials) + "점"} />
            <DetailCard label="연간 증가" value={formatNumber(university.collection.annualIncrease) + "권"} />
            <DetailCard label="연간 폐기" value={formatNumber(university.collection.annualDiscard) + "권"} />
            <DetailCard label="전자저널 패키지" value={formatNumber(university.digital.totalPackages) + "종"} />
            <DetailCard label="전자자료 종수" value={formatNumber(university.digital.totalTypes) + "종"} />
          </div>
        </Section>

        <Section title="예산 상세 (결산 기준)">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DetailCard label="대학 총결산" value={formatCurrency(university.budget.universityTotal)} />
            <DetailCard label="자료구입비 합계" value={formatCurrency(university.budget.materialBudgetTotal)} />
            <DetailCard label="도서자료 (국내)" value={formatCurrency(university.budget.domesticBooks)} />
            <DetailCard label="도서자료 (국외)" value={formatCurrency(university.budget.foreignBooks)} />
            <DetailCard label="전자자료 합계" value={formatCurrency(university.budget.digitalTotal)} />
            <DetailCard label="전자저널 (국내)" value={formatCurrency(university.budget.ejournalDomestic)} />
            <DetailCard label="전자저널 (국외)" value={formatCurrency(university.budget.ejournalForeign)} />
            <DetailCard label="예산 대비 비율" value={formatPercent(university.indicators.budgetRatio)} />
          </div>
        </Section>
      </main>

      <footer className="border-t border-rinfo-200 bg-white py-6 text-center text-sm text-rinfo-600">
        데이터 출처: KERIS 2025년 대학도서관 실태조사
        <br />
        <a href="https://github.com/tobl-ai" className="mt-1 inline-block text-xs text-gray-400 hover:text-rinfo-500" target="_blank" rel="noopener noreferrer">tobl.ai</a>
      </footer>
    </div>
  );
}

function RankItem({ label, rank, total }: { label: string; rank: number; total: number }) {
  const pct = Math.round((1 - rank / total) * 100);
  return (
    <div>
      <p className="text-sm text-rinfo-600">{label}</p>
      <p className="text-lg font-bold text-rinfo-900">
        {rank}위 <span className="text-sm font-normal text-rinfo-400">/ {total}개 (상위 {pct}%)</span>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-rinfo-500">{label}</span>
      <span className="font-medium text-rinfo-900">{value}</span>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-rinfo-200/60 bg-white p-4">
      <p className="text-sm text-rinfo-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-rinfo-900">{value}</p>
    </div>
  );
}

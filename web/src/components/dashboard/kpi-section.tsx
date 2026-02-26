import type { SummaryStats } from "@/types/university";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface Props {
  summary: SummaryStats;
}

export function KpiSection({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        icon="🏫"
        title="총 대학 수"
        value={`${summary.totalUniversities}개`}
      />
      <KpiCard
        icon="📚"
        title="총 소장 도서"
        value={`${(summary.totalBooks / 1_0000_0000).toFixed(1)}억 권`}
        subtitle={`1인당 ${summary.avgBooksPerStudent}권`}
      />
      <KpiCard
        icon="💰"
        title="총 자료구입비"
        value={formatCurrency(summary.totalMaterialBudget)}
        subtitle={`1인당 ${formatCurrency(summary.avgBudgetPerStudent)}`}
      />
      <KpiCard
        icon="👥"
        title="총 이용자"
        value={`${(summary.totalVisitors / 10000).toFixed(0)}만 명`}
      />
      <KpiCard
        icon="📖"
        title="총 대출 책수"
        value={`${(summary.totalLoans / 10000).toFixed(0)}만 권`}
      />
      <KpiCard
        icon="💻"
        title="전자자료 구입비 비율"
        value={`${summary.avgDigitalBudgetRatio}%`}
        subtitle="자료구입비 대비 평균"
      />
    </div>
  );
}

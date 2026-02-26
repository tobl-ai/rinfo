"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import { Tabs } from "@/components/ui/tabs";
import { TypeBooksChart } from "@/components/charts/type-books-chart";
import { BooksPerStudentChart } from "@/components/charts/books-per-student-chart";
import { BudgetLoanScatter } from "@/components/charts/budget-loan-scatter";
import { EstablishmentBudgetChart } from "@/components/charts/establishment-budget-chart";
import { SizeRadarChart } from "@/components/charts/size-radar-chart";
import { DigitalBudgetPie } from "@/components/charts/digital-budget-pie";
import { TopUniversitiesChart } from "@/components/charts/top-universities-chart";
import { BudgetCompositionChart } from "@/components/charts/budget-composition-chart";
import { EfficiencyScatter } from "@/components/charts/efficiency-scatter";
import { CollectionGrowthChart } from "@/components/charts/collection-growth-chart";
import { StaffAnalysisChart } from "@/components/charts/staff-analysis-chart";
import { EserviceChart } from "@/components/charts/eservice-chart";
import { DigitalAdoptionChart } from "@/components/charts/digital-adoption-chart";
import { PercentileDistributionChart } from "@/components/charts/percentile-distribution-chart";
import { IllNetworkChart } from "@/components/charts/ill-network-chart";
import { StatsSummaryTable } from "@/components/charts/stats-summary-table";
import { CorrelationHeatmap } from "@/components/charts/correlation-heatmap";
import { RegressionChart } from "@/components/charts/regression-chart";
import { GiniLorenzChart } from "@/components/charts/gini-lorenz-chart";
import { ClusterChart } from "@/components/charts/cluster-chart";
import { OutlierTable } from "@/components/charts/outlier-table";
import { CvComparisonChart } from "@/components/charts/cv-comparison-chart";
import { BoxPlotChart } from "@/components/charts/box-plot-chart";
import { ParetoChart } from "@/components/charts/pareto-chart";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const SECTIONS = [
  { id: "overview", label: "개요" },
  { id: "deep", label: "심층 분석" },
  { id: "advanced", label: "고급 통계" },
  { id: "stats", label: "통계 요약" },
];

export function ChartsSection({ universities }: Props) {
  const [section, setSection] = useState("overview");

  return (
    <div>
      <div className="mb-6">
        <Tabs tabs={SECTIONS} defaultTab={section} onChange={setSection} />
      </div>
      {section === "overview" && <OverviewCharts universities={universities} />}
      {section === "deep" && <DeepCharts universities={universities} />}
      {section === "advanced" && <AdvancedCharts universities={universities} />}
      {section === "stats" && <StatsCharts universities={universities} />}
    </div>
  );
}

function OverviewCharts({ universities }: Props) {
  return (
    <div className="space-y-6">
      <Section title="Top 20 대학 랭킹">
        <TopUniversitiesChart universities={universities} />
      </Section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="대학 유형별 소장 도서 수 (만 권)">
          <TypeBooksChart universities={universities} />
        </Section>
        <Section title="재학생 1인당 소장 도서 수 분포">
          <BooksPerStudentChart universities={universities} />
        </Section>
        <Section title="자료구입비 vs 대출 책수">
          <BudgetLoanScatter universities={universities} />
        </Section>
        <Section title="설립주체별 평균 자료구입비 (만원)">
          <EstablishmentBudgetChart universities={universities} />
        </Section>
        <Section title="규모별 주요 지표 비교">
          <SizeRadarChart universities={universities} />
        </Section>
        <Section title="자료구입비 구성 비율">
          <DigitalBudgetPie universities={universities} />
        </Section>
      </div>
    </div>
  );
}

function DeepCharts({ universities }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="예산 구성 비교 (억원)">
          <BudgetCompositionChart universities={universities} />
        </Section>
        <Section title="투입 대비 성과 상관 분석">
          <EfficiencyScatter universities={universities} />
        </Section>
        <Section title="장서 증감 분석 (학교유형별 평균)">
          <CollectionGrowthChart universities={universities} />
        </Section>
        <Section title="인력 현황 분석">
          <StaffAnalysisChart universities={universities} />
        </Section>
        <Section title="전자서비스 Top 10">
          <EserviceChart universities={universities} />
        </Section>
        <Section title="전자자료 투자 vs 활용">
          <DigitalAdoptionChart universities={universities} />
        </Section>
        <Section title="주요 지표 백분위 분포">
          <PercentileDistributionChart universities={universities} />
        </Section>
        <Section title="상호대차 활동 Top 15">
          <IllNetworkChart universities={universities} />
        </Section>
      </div>
    </div>
  );
}

function AdvancedCharts({ universities }: Props) {
  return (
    <div className="space-y-6">
      <Section title="선형 회귀 분석 (OLS)">
        <RegressionChart universities={universities} />
      </Section>
      <Section title="지니계수 · 로렌츠 곡선">
        <GiniLorenzChart universities={universities} />
      </Section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="K-Means 클러스터링">
          <ClusterChart universities={universities} />
        </Section>
        <Section title="파레토 분석 (80/20)">
          <ParetoChart universities={universities} />
        </Section>
        <Section title="박스플롯 (설립유형별 분포)">
          <BoxPlotChart universities={universities} />
        </Section>
        <Section title="변동계수(CV) 비교">
          <CvComparisonChart universities={universities} />
        </Section>
      </div>
      <Section title="Z-Score 이상치 탐지 (|z| ≥ 2.5)">
        <OutlierTable universities={universities} />
      </Section>
    </div>
  );
}

function StatsCharts({ universities }: Props) {
  return (
    <div className="space-y-6">
      <Section title="전체 대학 주요 지표 분포 (426개 대학)">
        <StatsSummaryTable universities={universities} />
      </Section>
      <Section title="지표 간 상관관계 히트맵">
        <CorrelationHeatmap universities={universities} />
      </Section>
    </div>
  );
}

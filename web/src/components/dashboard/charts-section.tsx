"use client";

import { Section } from "@/components/ui/section";
import { TypeBooksChart } from "@/components/charts/type-books-chart";
import { BooksPerStudentChart } from "@/components/charts/books-per-student-chart";
import { BudgetLoanScatter } from "@/components/charts/budget-loan-scatter";
import { EstablishmentBudgetChart } from "@/components/charts/establishment-budget-chart";
import { SizeRadarChart } from "@/components/charts/size-radar-chart";
import { DigitalBudgetPie } from "@/components/charts/digital-budget-pie";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function ChartsSection({ universities }: Props) {
  return (
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
  );
}

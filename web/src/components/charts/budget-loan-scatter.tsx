"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

export function BudgetLoanScatter({ universities }: Props) {
  const data = universities
    .filter(
      (u) =>
        u.budget.materialBudgetTotal > 0 && u.usage.loanBooks > 0
    )
    .map((u) => ({
      name: u.name,
      x: Math.round(u.budget.materialBudgetTotal / 1_0000_0000),
      y: u.usage.loanBooks,
      z: u.studentsCurrYear,
    }));

  return (
    <div>
      <ChartWrapper height={350}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis
            type="number"
            dataKey="x"
            name="자료구입비"
            unit="억"
            fontSize={12}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="대출 책수"
            fontSize={12}
          />
          <ZAxis type="number" dataKey="z" range={[20, 400]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-600">자료구입비: {d?.x}억원</p>
                  <p className="text-rinfo-600">대출 책수: {d?.y?.toLocaleString()}권</p>
                  <p className="text-rinfo-600">재학생: {d?.z?.toLocaleString()}명</p>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#4a90d9" fillOpacity={0.7} />
        </ScatterChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        자료구입비를 많이 쓰는 대학일수록 대출 책수도 많은 경향이 보입니다. 점의 크기는 재학생 수를 나타내며, 큰 점일수록 학생 수가 많은 대학입니다. 오른쪽 위에 위치한 대학은 예산과 이용 모두 활발한 도서관입니다.
      </p>
    </div>
  );
}

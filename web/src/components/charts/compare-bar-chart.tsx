"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
  metric: keyof University["indicators"];
  label: string;
  unit: string;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export function CompareBarChart({ universities, metric, label, unit }: Props) {
  const data = universities.map((u) => ({
    name: u.name.length > 8 ? u.name.slice(0, 8) + "..." : u.name,
    value: u.indicators[metric],
  }));

  return (
    <ChartWrapper height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={11} />
        <YAxis fontSize={12} />
        <Tooltip formatter={(v) => `${v}${unit}`} />
        <Bar dataKey="value" name={label}>
          {data.map((_, i) => (
            <rect key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartWrapper>
  );
}

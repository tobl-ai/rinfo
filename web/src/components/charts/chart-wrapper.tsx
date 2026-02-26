"use client";

import { ResponsiveContainer } from "recharts";

interface ChartWrapperProps {
  children: React.ReactElement;
  height?: number;
}

export function ChartWrapper({ children, height = 350 }: ChartWrapperProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

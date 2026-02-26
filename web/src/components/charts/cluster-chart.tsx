"use client";

import { useState, useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Legend } from "recharts";
import { ChartWrapper } from "./chart-wrapper";
import { Tabs } from "@/components/ui/tabs";
import { kMeans2D } from "@/lib/statistics";
import type { University } from "@/types/university";

interface Props {
  universities: University[];
}

const AXES = [
  {
    id: "invest-output", label: "투자-성과",
    xFn: (u: University) => u.indicators.budgetPerStudent / 10000,
    yFn: (u: University) => u.indicators.loansPerStudent,
    xLabel: "1인당 예산(만원)", yLabel: "1인당 대출(권)",
  },
  {
    id: "size-quality", label: "규모-품질",
    xFn: (u: University) => u.studentsCurrYear,
    yFn: (u: University) => u.indicators.booksPerStudent,
    xLabel: "재학생 수", yLabel: "1인당 장서(권)",
  },
  {
    id: "digital-traditional", label: "디지털-전통",
    xFn: (u: University) => u.indicators.digitalBudgetRatio,
    yFn: (u: University) => u.indicators.booksPerStudent,
    xLabel: "전자자료 비율(%)", yLabel: "1인당 장서(권)",
  },
];

const CLUSTER_COLORS = ["#f47721", "#4a90d9", "#5bba6f", "#9b59b6"];
const CLUSTER_NAMES = ["그룹 A", "그룹 B", "그룹 C", "그룹 D"];

export function ClusterChart({ universities }: Props) {
  const [axisId, setAxisId] = useState("invest-output");
  const [k, setK] = useState(3);
  const axis = AXES.find((a) => a.id === axisId) || AXES[0];

  const { clusters, narrative } = useMemo(() => {
    const pts = universities
      .filter((u) => u.studentsCurrYear > 0)
      .map((u) => ({
        name: u.name, type: u.type, size: u.size,
        x: Math.round(axis.xFn(u) * 100) / 100,
        y: Math.round(axis.yFn(u) * 100) / 100,
      }))
      .filter((d) => isFinite(d.x) && isFinite(d.y) && d.x > 0 && d.y > 0);

    const result = kMeans2D(pts.map((p) => ({ x: p.x, y: p.y })), k);
    const labeled = pts.map((p, i) => ({ ...p, cluster: result.labels[i] }));

    const clusterStats = Array.from({ length: k }, (_, c) => {
      const members = labeled.filter((p) => p.cluster === c);
      const avgX = members.reduce((s, p) => s + p.x, 0) / (members.length || 1);
      const avgY = members.reduce((s, p) => s + p.y, 0) / (members.length || 1);
      // 중심에 가장 가까운 3개 대학 = 대표 대학
      const reps = [...members]
        .map((m) => ({ ...m, dist: (m.x - avgX) ** 2 + (m.y - avgY) ** 2 }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
        .map((m) => m.name);
      return { count: members.length, avgX: Math.round(avgX * 10) / 10, avgY: Math.round(avgY * 10) / 10, reps };
    });

    const desc = clusterStats.map((cs, i) =>
      `${CLUSTER_NAMES[i]}(${cs.count}개, 평균 ${axis.xLabel} ${cs.avgX} / ${axis.yLabel} ${cs.avgY}) — 대표 대학: ${cs.reps.join(", ")}`
    ).join(". ");

    const n = `K-Means 클러스터링(k=${k})으로 ${pts.length}개 대학을 ${k}개 그룹으로 분류했습니다. ${desc}. ` +
      `같은 그룹에 속한 대학은 비슷한 투자-성과 패턴을 가진 대학으로, 벤치마킹 대상을 찾을 때 참고할 수 있습니다.`;

    return { clusters: labeled, narrative: n };
  }, [universities, axis, k]);

  const groups = Array.from({ length: k }, (_, i) =>
    clusters.filter((p) => p.cluster === i)
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Tabs tabs={AXES.map((a) => ({ id: a.id, label: a.label }))} defaultTab={axisId} onChange={setAxisId} />
        <select
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          className="rounded-md border border-rinfo-200 bg-white px-2 py-1.5 text-sm text-rinfo-700"
        >
          {[2, 3, 4].map((n) => (
            <option key={n} value={n}>{n}개 클러스터</option>
          ))}
        </select>
      </div>
      <ChartWrapper height={400}>
        <ScatterChart margin={{ bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fff5eb" />
          <XAxis type="number" dataKey="x" name={axis.xLabel} fontSize={11} />
          <YAxis type="number" dataKey="y" name={axis.yLabel} fontSize={11} />
          <ZAxis range={[30, 30]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="rounded-lg border border-rinfo-200 bg-white p-3 text-xs shadow-lg">
                  <p className="font-semibold text-rinfo-800">{d?.name}</p>
                  <p className="text-rinfo-500">{d?.type} · {d?.size}</p>
                  <p className="text-rinfo-600">{axis.xLabel}: {d?.x}</p>
                  <p className="text-rinfo-600">{axis.yLabel}: {d?.y}</p>
                  <p style={{ color: CLUSTER_COLORS[d?.cluster] }}>{CLUSTER_NAMES[d?.cluster]}</p>
                </div>
              );
            }}
          />
          {groups.map((g, i) => (
            <Scatter key={i} name={CLUSTER_NAMES[i]} data={g} fill={CLUSTER_COLORS[i]} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ChartWrapper>
      <p className="mt-3 rounded-lg bg-rinfo-50/60 p-3 text-xs leading-relaxed text-rinfo-700">
        {narrative}
      </p>
    </div>
  );
}

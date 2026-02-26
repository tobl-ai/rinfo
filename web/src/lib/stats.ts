import type { University } from "@/types/university";

export function computeAverages(
  universities: University[]
): Record<string, number> {
  const keys = [
    "booksPerStudent",
    "annualIncreasePerStudent",
    "areaPerStudent",
    "staffPer1000",
    "budgetRatio",
    "budgetPerStudent",
    "digitalBudgetRatio",
    "loansPerStudent",
    "borrowerRatio",
  ] as const;

  const result: Record<string, number> = {};
  for (const key of keys) {
    const vals = universities.map((u) => u.indicators[key]).filter((v) => v > 0);
    result[key] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  return result;
}

export function getRankInGroup(
  university: University,
  group: University[],
  metric: (u: University) => number
): { rank: number; total: number } {
  const sorted = [...group].sort((a, b) => metric(b) - metric(a));
  const rank = sorted.findIndex((u) => u.id === university.id) + 1;
  return { rank, total: sorted.length };
}

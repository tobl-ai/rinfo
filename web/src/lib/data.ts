import type { University, SummaryStats } from "@/types/university";
import universitiesJson from "@/data/universities.json";
import summaryJson from "@/data/summary.json";

export function getUniversities(): University[] {
  return universitiesJson as University[];
}

export function getSummary(): SummaryStats {
  return summaryJson as SummaryStats;
}

export function getUniversityById(id: string): University | undefined {
  return getUniversities().find((u) => u.id === id);
}

export function getUniversitiesByIds(ids: string[]): University[] {
  const set = new Set(ids);
  return getUniversities().filter((u) => set.has(u.id));
}

export function searchUniversities(query: string): University[] {
  const q = query.toLowerCase();
  return getUniversities().filter((u) => u.name.toLowerCase().includes(q));
}

export function filterUniversities(opts: {
  type?: string;
  category?: string;
  size?: string;
}): University[] {
  return getUniversities().filter((u) => {
    if (opts.type && u.type !== opts.type) return false;
    if (opts.category && u.category !== opts.category) return false;
    if (opts.size && u.size !== opts.size) return false;
    return true;
  });
}

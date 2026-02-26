/** 선형 회귀 (최소제곱법) */
export function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0, r: 0 };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let ssXY = 0, ssXX = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }
  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = my - slope * mx;
  const r = ssXX * ssYY === 0 ? 0 : ssXY / Math.sqrt(ssXX * ssYY);
  return { slope, intercept, r2: r * r, r };
}

/** 피어슨 상관계수 */
export function pearsonCorrelation(xs: number[], ys: number[]) {
  return linearRegression(xs, ys).r;
}

/** 지니계수 + 로렌츠 곡선 포인트 */
export function giniCoefficient(values: number[]) {
  const sorted = [...values].filter((v) => v >= 0).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return { gini: 0, lorenz: [] as { x: number; y: number }[] };
  const total = sorted.reduce((a, b) => a + b, 0);
  if (total === 0) return { gini: 0, lorenz: [] };

  const lorenz: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  let cumulative = 0;
  for (let i = 0; i < n; i++) {
    cumulative += sorted[i];
    if ((i + 1) % Math.max(1, Math.floor(n / 50)) === 0 || i === n - 1) {
      lorenz.push({
        x: Math.round(((i + 1) / n) * 1000) / 10,
        y: Math.round((cumulative / total) * 1000) / 10,
      });
    }
  }

  let area = 0;
  cumulative = 0;
  for (let i = 0; i < n; i++) {
    cumulative += sorted[i];
    area += cumulative;
  }
  const gini = 1 - (2 * area) / (n * total) + 1 / n;
  return { gini: Math.round(gini * 1000) / 1000, lorenz };
}

/** Z-score 계산 */
export function zScores(values: number[]) {
  const n = values.length;
  if (n === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  if (std === 0) return values.map(() => 0);
  return values.map((v) => (v - mean) / std);
}

/** 변동계수 (Coefficient of Variation) */
export function coefficientOfVariation(values: number[]) {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return 0;
  const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
  return std / Math.abs(mean);
}

/** K-Means 클러스터링 (2D) */
export function kMeans2D(
  points: { x: number; y: number }[],
  k: number,
  maxIter = 50
): { centroids: { x: number; y: number }[]; labels: number[] } {
  const n = points.length;
  if (n === 0 || k <= 0) return { centroids: [], labels: [] };

  // min-max 정규화
  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x));
  const yMin = Math.min(...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y));
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const norm = points.map((p) => ({
    x: (p.x - xMin) / xRange,
    y: (p.y - yMin) / yRange,
  }));

  // 초기 중심: 균등 간격
  let centroids = Array.from({ length: k }, (_, i) => ({
    x: (i + 0.5) / k,
    y: (i + 0.5) / k,
  }));

  let labels = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // 할당
    const newLabels = norm.map((p) => {
      let minDist = Infinity;
      let best = 0;
      for (let c = 0; c < k; c++) {
        const d = (p.x - centroids[c].x) ** 2 + (p.y - centroids[c].y) ** 2;
        if (d < minDist) { minDist = d; best = c; }
      }
      return best;
    });

    // 수렴 체크
    if (newLabels.every((l, i) => l === labels[i])) break;
    labels = newLabels;

    // 중심 재계산
    centroids = Array.from({ length: k }, (_, c) => {
      const members = norm.filter((_, i) => labels[i] === c);
      if (members.length === 0) return centroids[c];
      return {
        x: members.reduce((s, p) => s + p.x, 0) / members.length,
        y: members.reduce((s, p) => s + p.y, 0) / members.length,
      };
    });
  }

  // 역정규화
  const finalCentroids = centroids.map((c) => ({
    x: c.x * xRange + xMin,
    y: c.y * yRange + yMin,
  }));

  return { centroids: finalCentroids, labels };
}

/** 사분위수 */
export function quartiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const q = (p: number) => {
    const idx = p * (n - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };
  return {
    min: sorted[0] ?? 0,
    q1: q(0.25),
    median: q(0.5),
    q3: q(0.75),
    max: sorted[n - 1] ?? 0,
    iqr: q(0.75) - q(0.25),
  };
}

/** 스피어만 순위상관계수 */
export function spearmanCorrelation(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return 0;
  const rank = (arr: number[]) => {
    const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    for (let i = 0; i < n; i++) ranks[sorted[i].i] = i + 1;
    return ranks;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  return pearsonCorrelation(rx, ry);
}

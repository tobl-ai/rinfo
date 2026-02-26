export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatCurrency(n: number): string {
  if (n >= 1_0000_0000) {
    return `${(n / 1_0000_0000).toFixed(1)}억원`;
  }
  if (n >= 10000) {
    return `${(n / 10000).toFixed(0)}만원`;
  }
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

import { readCsvStream } from "../util/csv.js";
export async function queryQ2(indexDir: string, t1: number, t2: number, k: number) {
  const data = process.env.DATASET || "/data/logs_S.csv";
  const m = new Map<string, number>();
  await readCsvStream(data, (row) => {
    const ts = Number(row.timestamp ?? row.ts);
    if (!Number.isFinite(ts) || ts < t1 || ts > t2) return;
    const a = row.action ? String(row.action) : null;
    if (!a) return;
    m.set(a, (m.get(a) || 0) + 1);
  });
  const arr = Array.from(m.entries()).map(([action, count]) => ({ action, count }));
  arr.sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));
  return arr.slice(0, k);
}

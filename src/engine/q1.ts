import { readCsvStream } from "../util/csv.js";
export async function queryQ1(indexDir: string, t1: number, t2: number): Promise<number> {
  const data = process.env.DATASET || "/data/logs_S.csv";
  const s = new Set<string>();
  await readCsvStream(data, (row) => {
    const ts = Number(row.timestamp ?? row.ts);
    if (!Number.isFinite(ts) || ts < t1 || ts > t2) return;
    if (row.user) s.add(String(row.user));
  });
  return s.size;
}

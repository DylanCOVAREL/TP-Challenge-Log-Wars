import { readCsvStream } from "../util/csv.js";
export async function queryQ3(indexDir: string, t1: number, t2: number, user: string, action: string): Promise<number> {
  const data = process.env.DATASET || "/data/logs_S.csv";
  let c = 0;
  await readCsvStream(data, (row) => {
    const ts = Number(row.timestamp ?? row.ts);
    if (!Number.isFinite(ts) || ts < t1 || ts > t2) return;
    if (String(row.user) === user && String(row.action) === action) c++;
  });
  return c;
}

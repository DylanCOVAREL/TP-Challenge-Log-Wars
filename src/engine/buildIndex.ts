import fs from "fs";
import path from "path";
import { readCsvStream } from "../util/csv.js";

export async function buildIndex(dataPath: string, indexDir: string) {
  if (!fs.existsSync(indexDir)) fs.mkdirSync(indexDir, { recursive: true });
  let rows = 0, minTs = Number.POSITIVE_INFINITY, maxTs = 0;
  const users = new Set<string>(), actions = new Set<string>();
  const t0 = Date.now();
  await readCsvStream(dataPath, (row) => {
    const ts = Number(row.timestamp ?? row.ts);
    if (!Number.isFinite(ts)) return;
    rows++; if (ts < minTs) minTs = ts; if (ts > maxTs) maxTs = ts;
    if (row.user) users.add(String(row.user));
    if (row.action) actions.add(String(row.action));
  });
  const buildMs = Date.now() - t0;
  fs.writeFileSync(path.join(indexDir, "meta.json"), JSON.stringify({ version: 1, dataset: path.basename(dataPath), createdAt: Date.now(), notes: "V1 naive" }, null, 2));
  fs.writeFileSync(path.join(indexDir, "summary.json"), JSON.stringify({ rows, timeRange: { minTs, maxTs }, distinctUsers: users.size, distinctActions: actions.size, buildMs }, null, 2));
  console.log(JSON.stringify({ ok: true, rows, buildMs }));
}

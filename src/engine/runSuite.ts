import fs from "fs";
import path from "path";
import { queryQ1 } from "./q1.js";
import { queryQ2 } from "./q2.js";
import { queryQ3 } from "./q3.js";

type Q = { type: "q1"|"q2"|"q3"; t1: number; t2: number; k?: number; user?: string; action?: string; };

function percentile(arr: number[], p: number) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a,b)=>a-b);
  const idx = Math.ceil((p/100)*s.length) - 1;
  return s[Math.max(0, Math.min(s.length-1, idx))];
}

export async function runSuite(indexDir: string, queriesFile: string, outDir: string, runs: number) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const raw = JSON.parse(fs.readFileSync(queriesFile, "utf-8"));
  const qs: Q[] = raw.queries ?? [];
  const latAll: {type:string;latency_ms:number}[] = [];

  for (let i = 1; i <= runs; i++) {
    const perRun: any[] = [];
    for (const q of qs) {
      const t0 = typeof process.hrtime === "function" ? Number(process.hrtime.bigint()/1000000n) : Date.now();
      let result: any;
      if (q.type === "q1") result = await queryQ1(indexDir, q.t1, q.t2);
      else if (q.type === "q2") result = await queryQ2(indexDir, q.t1, q.t2, q.k ?? 10);
      else result = await queryQ3(indexDir, q.t1, q.t2, String(q.user??""), String(q.action??""));
      const t1 = typeof process.hrtime === "function" ? Number(process.hrtime.bigint()/1000000n) : Date.now();
      const dt = t1 - t0;
      latAll.push({ type: q.type, latency_ms: dt });
      perRun.push({ ...q, latency_ms: dt, result });
    }
    fs.writeFileSync(path.join(outDir, `results_run_${i}.json`), JSON.stringify(perRun, null, 2));
  }

  const csv = ["type,latency_ms", ...latAll.map(l => `${l.type},${l.latency_ms}`)].join("\n");
  fs.writeFileSync(path.join(outDir, "latencies.csv"), csv);

  const by = { q1: [] as number[], q2: [] as number[], q3: [] as number[] };
  for (const l of latAll) (by as any)[l.type].push(l.latency_ms);

  const summary = { runs, P50: { q1: percentile(by.q1,50), q2: percentile(by.q2,50), q3: percentile(by.q3,50) },
                          P95: { q1: percentile(by.q1,95), q2: percentile(by.q2,95), q3: percentile(by.q3,95) } };
  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ok: true, out: outDir, summary }));
}

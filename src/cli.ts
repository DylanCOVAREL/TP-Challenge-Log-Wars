#!/usr/bin/env node
import { Command } from "commander";
import { buildIndex } from "./engine/buildIndex.js";
import { queryQ1 } from "./engine/q1.js";
import { queryQ2 } from "./engine/q2.js";
import { queryQ3 } from "./engine/q3.js";
import { runSuite } from "./engine/runSuite.js";

const program = new Command();

program.name("engine").description("Log Wars engine CLI");

// build
program
  .command("build")
  .requiredOption("--data <file>", "Chemin du dataset CSV")
  .requiredOption("--index <dir>", "Répertoire de l'index")
  .action(async (opts) => { await buildIndex(opts.data, opts.index); });

// q1
program
  .command("q1")
  .requiredOption("--index <dir>")
  .requiredOption("--t1 <number>", "epoch ms", Number)
  .requiredOption("--t2 <number>", "epoch ms", Number)
  .action(async (o) => { const r = await queryQ1(o.index, o.t1, o.t2); console.log(r); });

// q2
program
  .command("q2")
  .requiredOption("--index <dir>")
  .requiredOption("--t1 <number>", "epoch ms", Number)
  .requiredOption("--t2 <number>", "epoch ms", Number)
  .requiredOption("--k <number>", "Top K", Number)
  .action(async (o) => { const r = await queryQ2(o.index, o.t1, o.t2, o.k); console.log(JSON.stringify(r)); });

// q3
program
  .command("q3")
  .requiredOption("--index <dir>")
  .requiredOption("--t1 <number>", "epoch ms", Number)
  .requiredOption("--t2 <number>", "epoch ms", Number)
  .requiredOption("--user <string>")
  .requiredOption("--action <string>")
  .action(async (o) => { const r = await queryQ3(o.index, o.t1, o.t2, o.user, o.action); console.log(r); });

// run-suite
program
  .command("run-suite")
  .requiredOption("--index <dir>")
  .requiredOption("--queries <file>")
  .option("--outdir <dir>", "Default: /out", "/out")
  .option("--runs <number>", "Default: 5", "5")
  .action(async (o) => { await runSuite(o.index, o.queries, o.outdir, Number(o.runs)); });

program.parseAsync();

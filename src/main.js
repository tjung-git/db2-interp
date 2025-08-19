import dotenv from "dotenv";
dotenv.config();
import { ABDSolverLite } from "./algorithms/abd.js";
import { Pipeline } from "./core/pipeline.js";
import { permutations, combinations } from "./math/combinatorics.js";
import { fetchSeriesFromDb2 } from "./db2.js";

function banner(msg) {
  console.log(`\n=== ${msg} ===`);
}

function makeDemoBlocks({ p = 4, s = 2 } = {}) {
  // small demo
  const A = [],
    B = [],
    C = [];
  for (let i = 0; i < p; i++) {
    const diag = [];
    for (let r = 0; r < s; r++)
      for (let c = 0; c < s; c++)
        diag.push(r === c ? 3.0 + (i + 1) * 0.1 : 0.2);
    A.push(diag);
    if (i < p - 1) {
      const up = [];
      for (let r = 0; r < s; r++)
        for (let c = 0; c < s; c++) up.push(r === c ? 0.5 : 0.0);
      const low = [];
      for (let r = 0; r < s; r++)
        for (let c = 0; c < s; c++) low.push(r === c ? 0.4 : 0.0);
      B.push(up);
      C.push(low);
    }
  }
  // simple rhs
  const rhs = Array(p * s)
    .fill(0)
    .map((_, i) => 1 + 0.1 * i);
  return { blocks: { s, A, B, C }, rhs };
}

async function fromDb2Example() {
  // just show shape
  const table = process.env.DB2_TABLE || "MYSCHEMA.SERIES";
  const xcol = process.env.DB2_XCOL || "XVAL";
  const ycol = process.env.DB2_YCOL || "YVAL";
  banner(`Db2 fetch (${table}:${xcol},${ycol})`);
  const payload = await fetchSeriesFromDb2({ table, xcol, ycol, limit: 50 });
  console.log("mode:", payload.mode, "rows:", payload.rows.length);
  // small demo blocs
  const { blocks, rhs } = makeDemoBlocks({ p: 4, s: 2 });
  // map if exists
  payload.rows.slice(0, rhs.length).forEach((r, i) => (rhs[i] = r.y));
  return { blocks, rhs };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.length === 0) {
    console.log(`Usage:
  node src/main.js --demo                 # run built-in ABD demo
  node src/main.js --db2                  # fetch series from Db2 (uses .env), then solve
  node src/main.js --count n r            # print nPr and nCr
`);
    return;
  }

  if (args[0] === "--count") {
    const n = Number(args[1]),
      r = Number(args[2]);
    console.log(`permutations(${n},${r}) = ${permutations(n, r)}`);
    console.log(`combinations(${n},${r}) = ${combinations(n, r)}`);
    return;
  }

  let dataset;
  if (args[0] === "--db2") {
    dataset = await fromDb2Example();
  } else {
    // slightly larger demo
    dataset = makeDemoBlocks({ p: 5, s: 3 });
  }

  const { blocks, rhs } = dataset;

  banner("ABD Solve");
  const pipe = new Pipeline();
  pipe.add("abd_solve", new ABDSolverLite(), blocks, rhs);

  console.log("Blocks:", `p=${blocks.A.length}, s=${blocks.s}`);
  console.log("rhs length:", rhs.length);

  const results = pipe.runAll();
  const { result } = results[0];

  console.log("\nSolution x (first 12 entries):", result.meta.x.slice(0, 12));
  console.log("Total inner solves:", result.meta.solves);
  console.log("Note:", result.meta.note);

  banner("LinkedList sanity");
  // sanity
  function demoLinkedList() {
    // not used, present as note
    const { LinkedList } = require("./structures/linkedList.js");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

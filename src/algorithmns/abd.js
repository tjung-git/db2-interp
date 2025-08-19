import { Algorithm, Result } from "../core/base.js";
import { LinkedList } from "../structures/linkedList.js";

// helpers
function toMat(flat, s) {
  const M = Array.from({ length: s }, () => Array(s).fill(0));
  for (let i = 0; i < s; i++)
    for (let j = 0; j < s; j++) M[i][j] = flat[i * s + j];
  return M;
}
function toVec(flat) {
  return flat.slice();
}
function matSub(A, B) {
  const s = A.length,
    C = Array.from({ length: s }, () => Array(s).fill(0));
  for (let i = 0; i < s; i++)
    for (let j = 0; j < s; j++) C[i][j] = A[i][j] - B[i][j];
  return C;
}
function matMul(A, B) {
  const s = A.length,
    C = Array.from({ length: s }, () => Array(s).fill(0));
  for (let i = 0; i < s; i++)
    for (let k = 0; k < s; k++)
      for (let j = 0; j < s; j++) C[i][j] += A[i][k] * B[k][j];
  return C;
}
function matVec(A, v) {
  const s = A.length,
    r = Array(s).fill(0);
  for (let i = 0; i < s; i++)
    for (let j = 0; j < s; j++) r[i] += A[i][j] * v[j];
  return r;
}

function solve1(Ain, bIn) {
  // GE + ppivot, single RHS
  const n = Ain.length,
    A = Ain.map((r) => r.slice()),
    b = bIn.slice();
  for (let k = 0; k < n - 1; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++)
      if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
    if (Math.abs(A[p][k]) === 0) throw new Error("Singular block");
    if (p !== k) {
      [A[k], A[p]] = [A[p], A[k]];
      [b[k], b[p]] = [b[p], b[k]];
    }
    for (let i = k + 1; i < n; i++) {
      const m = A[i][k] / A[k][k];
      for (let j = k; j < n; j++) A[i][j] -= m * A[k][j];
      b[i] -= m * b[k];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}
function solveMat(A, B) {
  // B RHS
  const s = A.length,
    X = Array.from({ length: s }, () => Array(s).fill(0));
  for (let j = 0; j < s; j++) {
    const colB = Array.from({ length: s }, (_, i) => B[i][j]);
    const colX = solve1(A, colB);
    for (let i = 0; i < s; i++) X[i][j] = colX[i];
  }
  return X;
}
const solveVec = (A, b) => solve1(A, b);

// block tridiagonal ABD solver
export class ABDSolverLite extends Algorithm {
  run(blocks, rhs) {
    const { s, A, B = [], C = [] } = blocks;
    const p = A.length;
    if (p < 1) throw new Error("Need at least one block row");
    if (rhs.length !== p * s) throw new Error("rhs length mismatch");

    // linkedlist rows
    const rows = new LinkedList();
    for (let i = 0; i < p; i++) {
      rows.append({
        i,
        A: toMat(A[i], s),
        B: i < p - 1 && B[i] ? toMat(B[i], s) : null,
        C: i > 0 && C[i - 1] ? toMat(C[i - 1], s) : null,
        d: toVec(rhs.slice(i * s, (i + 1) * s)),
      });
    }
    // ll -> arr for index
    const R = [];
    while (rows.size > 0) R.push(rows.popLeft());

    let solves = 0;

    // fw elim
    for (let i = 1; i < p; i++) {
      // prev
      const P = R[i - 1];
      // curr
      const Q = R[i];

      // RHS if B exiss
      let T = null;
      if (P.B) {
        T = solveMat(P.A, P.B);
        solves += s;
      } // RHS cols
      else {
        T = Array.from({ length: s }, () => Array(s).fill(0));
      }

      // vector RHS
      const y = solveVec(P.A, P.d);
      solves += 1;

      // update
      if (Q.C) {
        Q.A = matSub(Q.A, matMul(Q.C, T));
        const Cy = matVec(Q.C, y);
        for (let k = 0; k < s; k++) Q.d[k] -= Cy[k];
      }
    }

    // BS step
    const x = Array(p)
      .fill(0)
      .map(() => Array(s).fill(0));
    // fin block solver
    x[p - 1] = solveVec(R[p - 1].A, R[p - 1].d);
    solves += 1;

    for (let i = p - 2; i >= 0; i--) {
      const Bxi = R[i].B ? matVec(R[i].B, x[i + 1]) : Array(s).fill(0);
      const rhs_i = R[i].d.map((v, k) => v - Bxi[k]);
      x[i] = solveVec(R[i].A, rhs_i);
      solves += 1;
    }

    // flatten
    const xflat = x.flat();

    return new Result({
      x: xflat,
      solves,
      blocks: { p, s },
      note: "ABD block-tridiagonal solve, Keep s small for demos.",
    });
  }
}

import { Algorithm, Result } from "../core/base.js";

/**
 * First-form barycentric weights (simple, O(n^2) build).
 */
export class BarycentricInterpolation extends Algorithm {
  run(x, y) {
    const n = x.length;
    if (n !== y.length) throw new Error("x and y length mismatch");
    const w = Array(n).fill(1);
    for (let j = 0; j < n; j++) {
      let prod = 1;
      for (let k = 0; k < n; k++) {
        if (k !== j) prod *= x[j] - x[k];
      }
      w[j] = 1 / prod;
    }
    return new Result({ w, nodes: x.slice(), values: y.slice() });
  }
  static evaluate({ w, nodes, values }, t) {
    let num = 0,
      den = 0;
    for (let j = 0; j < nodes.length; j++) {
      if (t === nodes[j]) return values[j];
      const term = w[j] / (t - nodes[j]);
      num += term * values[j];
      den += term;
    }
    return num / den;
  }
}

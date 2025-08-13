import { Algorithm, Result } from "../core/base.js";

/**
 * Newton divided differences + nested evaluation.
 * Keeps math minimal and auditable.
 */
export class NewtonInterpolation extends Algorithm {
  run(x, y) {
    const n = x.length;
    if (n !== y.length) throw new Error("x and y length mismatch");
    const coef = y.slice();
    // coefficients in-place (upper triangle)
    for (let j = 1; j < n; j++) {
      for (let i = n - 1; i >= j; i--) {
        coef[i] = (coef[i] - coef[i - 1]) / (x[i] - x[i - j]);
      }
    }
    return new Result({ coef, nodes: x.slice() });
  }
  static evaluate(coef, nodes, t) {
    let acc = coef[coef.length - 1];
    for (let k = coef.length - 2; k >= 0; k--) {
      acc = acc * (t - nodes[k]) + coef[k];
    }
    return acc;
  }
}

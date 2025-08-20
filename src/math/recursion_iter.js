export function fact_rec(n) {
  if (n < 0) throw new Error("n>=0");
  if (n < 2) return 1;
  return n * fact_rec(n - 1);
}
export function fact_iter(n) {
  if (n < 0) throw new Error("n>=0");
  let a = 1;
  for (let k = 2; k <= n; k++) a *= k;
  return a;
}

export function permutations(n, r) {
  if (r < 0 || r > n) return 0;
  let acc = 1;
  for (let k = n; k > n - r; k--) acc *= k;
  return acc;
}
export function combinationsIter(n, r) {
  if (r < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let num = 1,
    den = 1;
  for (let k = 1; k <= r; k++) {
    num *= n - r + k;
    den *= k;
  }
  return Math.floor(num / den);
}

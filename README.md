# db2-interp-fullstack

A lean full‑stack demo focused on **numerical interpolation** with **optional Db2 input**.

- **Math**: Newton divided differences (with nested evaluation) and Barycentric interpolation.
- **OOP**: `Algorithm` (abstract) → `NewtonInterpolation` / `BarycentricInterpolation`.
- **Aggregation & Composition**: `Pipeline` aggregates tasks and **composes** a custom `LinkedList` as its FIFO queue.
- **Linked list**: iterative and recursive reverse implemented.
- **Counting principles**: `nPr`, `nCr` helpers used to reason about choosing subsets of nodes; exposed at `/api/counting`.
- **Db2**: optional source of `(x,y)` via `ibm_db` if `DB2_CONN_STR` is set; otherwise a safe mock path.

## Quickstart

```bash
# server
cd server
cp .env.example .env   # edit if you want real Db2
npm i
npm run dev

# client
cd ../client
npm i
npm run dev
```

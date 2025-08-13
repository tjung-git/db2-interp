import React, { useState } from "react";
import { interpolate, fetchDb2Series, counting } from "./api.js";

export default function App() {
  const [method, setMethod] = useState("newton");
  const [x, setX] = useState("-1,-0.5,0,0.5,1");
  const [y, setY] = useState("1,0.7788,1,1.2840,1.6487"); // ~exp(x) rounded
  const [t, setT] = useState("0.3");
  const [value, setValue] = useState(null);
  const [combInfo, setCombInfo] = useState(null);

  const run = async () => {
    const xs = x.split(",").map((s) => Number(s.trim()));
    const ys = y.split(",").map((s) => Number(s.trim()));
    const out = await interpolate({ method, x: xs, y: ys, t: Number(t) });
    setValue(out.value);
  };

  const calcComb = async () => {
    const n = x.split(",").filter(Boolean).length;
    const r = Math.min(n, 4);
    const info = await counting(n, r);
    setCombInfo({ n, r, ...info });
  };

  const loadDb2 = async () => {
    const payload = await fetchDb2Series({
      table: prompt("Db2 table name?"),
      xcol: prompt("x column?"),
      ycol: prompt("y column?"),
      limit: 200,
    });
    if (payload.rows?.length) {
      const xs = payload.rows.map((r) => r.x).join(",");
      const ys = payload.rows.map((r) => r.y).join(",");
      setX(xs);
      setY(ys);
      alert(
        `Loaded ${payload.rows.length} rows from ${
          payload.mode === "db2" ? "Db2" : "mock"
        }.`
      );
    } else {
      alert("No rows returned (check connection or table/columns).");
    }
  };

  return (
    <div
      style={{ fontFamily: "system-ui", maxWidth: 760, margin: "2rem auto" }}
    >
      <h1>Interpolation (Db2‑optional)</h1>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <label>
          Method:
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="newton">Newton (divided differences)</option>
            <option value="barycentric">Barycentric</option>
          </select>
        </label>
        <label>
          x (comma‑sep):{" "}
          <input
            value={x}
            onChange={(e) => setX(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          y (comma‑sep):{" "}
          <input
            value={y}
            onChange={(e) => setY(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          t (evaluate at):{" "}
          <input value={t} onChange={(e) => setT(e.target.value)} />
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={run}>Interpolate</button>
          <button onClick={loadDb2}>Load from Db2…</button>
          <button onClick={calcComb}>Counting (nPr / nCr)</button>
        </div>
        {value !== null && (
          <div>
            <b>p(t) ≈</b> {value}
          </div>
        )}
        {combInfo && (
          <div>
            With n={combInfo.n} nodes and r={combInfo.r}: nPr=
            {combInfo.permutations}, nCr={combInfo.combinations}
          </div>
        )}
      </div>
    </div>
  );
}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pipeline } from "./core/pipeline.js";
import { NewtonInterpolation } from "./algorithms/newton.js";
import { BarycentricInterpolation } from "./algorithms/barycentric.js";
import { permutations, combinationsIter } from "./algorithms/combinatorics.js";
import { fetchSeriesFromDb2 } from "./db2.js";
import { postCallback } from "./wx.js";
import { NewtonInterpolation } from "./algorithms/newton.js";
import { BarycentricInterpolation } from "./algorithms/barycentric.js";
import { fetchSeriesFromDb2 } from "./db2.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// POST /api/interpolate { method: "newton"|"barycentric", x: number[], y: number[], t: number }
app.post("/api/interpolate", (req, res) => {
  const { method, x, y, t } = req.body || {};
  const algo =
    method === "barycentric"
      ? new BarycentricInterpolation()
      : new NewtonInterpolation();

  const pipe = new Pipeline();
  pipe.add("interp", algo, x, y);
  const [{ result }] = pipe.runAll();

  let value;
  if (method === "barycentric")
    value = BarycentricInterpolation.evaluate(result.meta, t);
  else
    value = NewtonInterpolation.evaluate(
      result.meta.coef,
      result.meta.nodes,
      t
    );

  res.json({ value, meta: result.meta });
});

// GET /api/db2/series?table=T&xcol=X&ycol=Y&limit=200
app.get("/api/db2/series", async (req, res) => {
  try {
    const payload = await fetchSeriesFromDb2({
      table: req.query.table,
      xcol: req.query.xcol,
      ycol: req.query.ycol,
      limit: Number(req.query.limit || 200),
    });
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/counting?n=12&r=6 { permutations: nPr, combinations: nCr }
app.get("/api/counting", (req, res) => {
  const n = Number(req.query.n),
    r = Number(req.query.r);
  res.json({
    permutations: permutations(n, r),
    combinations: combinationsIter(n, r),
  });
});

// POST /api/wx/run
// Body can include either { data: {x:[], y:[]} } OR { db2: {table, xcol, ycol, limit} }.
// Required: method ("newton"|"barycentric"), t (number).
// Optional: callback_url (string). If present, we POST results back with HMAC header.
app.post("/api/wx/run", async (req, res) => {
  try {
    const { method = "newton", t, data, db2, callback_url } = req.body || {};
    if (typeof t !== "number")
      return res.status(400).json({ error: "t must be number" });

    // 1) get series
    let x = null,
      y = null,
      source = "inline";
    if (data?.x && data?.y) {
      x = data.x.map(Number);
      y = data.y.map(Number);
      if (x.length !== y.length || x.length === 0)
        throw new Error("x and y must be same non-zero length");
    } else if (db2?.table && db2?.xcol && db2?.ycol) {
      const pulled = await fetchSeriesFromDb2({
        table: db2.table,
        xcol: db2.xcol,
        ycol: db2.ycol,
        limit: Number(db2.limit || 200),
      });
      source = pulled.mode;
      if (!pulled.rows?.length) throw new Error("Db2 returned no rows");
      x = pulled.rows.map((r) => Number(r.x));
      y = pulled.rows.map((r) => Number(r.y));
    } else {
      return res
        .status(400)
        .json({ error: "Provide data:{x,y} or db2:{table,xcol,ycol[,limit]}" });
    }

    // 2) compute
    const algo =
      method === "barycentric"
        ? new BarycentricInterpolation()
        : new NewtonInterpolation();
    const meta = algo.run(x, y).meta;
    const value =
      method === "barycentric"
        ? BarycentricInterpolation.evaluate(meta, t)
        : NewtonInterpolation.evaluate(meta.coef, meta.nodes, t);

    // 3) reply immediately
    const payload = {
      ok: true,
      method,
      t,
      source,
      result: { value, meta },
    };
    res.json(payload);

    // 4) optional callback to watsonx (or any receiver)
    if (callback_url) {
      const secret = process.env.WX_HMAC_SECRET || "";
      try {
        await postCallback(callback_url, payload, secret);
      } catch (e) {
        // don't crash the original request—just log
        console.error("[callback error]", e);
      }
    }
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () =>
  console.log(`server listening on http://localhost:${port}`)
);

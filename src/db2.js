import dotenv from "dotenv";
dotenv.config();
let ibm_db = null;
try {
  ibm_db = await import("ibm_db");
} catch {}

export async function fetchSeriesFromDb2({ table, xcol, ycol, limit = 200 }) {
  if (!process.env.DB2_CONN_STR) return { mode: "mock", rows: [] };
  if (!ibm_db?.default) throw new Error("ibm_db module not installed");
  const conn = ibm_db.default.openSync(process.env.DB2_CONN_STR);
  try {
    const sql = `SELECT ${xcol} AS X, ${ycol} AS Y FROM ${table} ORDER BY ${xcol} FETCH FIRST ${limit} ROWS ONLY`;
    const rows = ibm_db.default.querySync(conn, sql);
    return {
      mode: "db2",
      rows: rows.map((r) => ({ x: Number(r.X), y: Number(r.Y) })),
    };
  } finally {
    ibm_db.default.closeSync(conn);
  }
}


import http from "http";
import url from "url";
import mysql from "mysql2/promise";
import { DB_CONFIG } from "./dbconfig.js";

const PORT = 5000;


async function initDB() {
  const conn = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database}`);
  await conn.end();

  const db = await mysql.createConnection(DB_CONFIG);
  await db.query(`
    CREATE TABLE IF NOT EXISTS patient (
      patientid INT(11) AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      dateOfBirth DATETIME
    ) ENGINE=InnoDB;
  `);
  await db.end();

  console.log("Database & table ready");
}


function sendJSON(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(obj));
}

async function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);
  const method = req.method;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }


    try {
    const db = await mysql.createConnection(DB_CONFIG);

    if (method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));

      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const query = data.query;

          if (/drop|delete|update/i.test(query))
            return sendJSON(res, 403, { error: "Forbidden SQL" });

          const [result] = await db.query(query);
          sendJSON(res, 200, { message: "Query executed", result });

        } catch (err) {
          console.error("❌ POST error:", err.message);
          sendJSON(res, 400, { error: "Invalid or failed SQL query", details: err.message });
        } finally {
          await db.end();
        }
      });
    }

    else if (method === "GET") {
      try {
        const q = parsed.query.sql;
        if (!q) return sendJSON(res, 400, { error: "Missing sql query" });

        if (/drop|delete|update/i.test(q))
          return sendJSON(res, 403, { error: "Forbidden SQL" });

        const [rows] = await db.query(q);
        sendJSON(res, 200, rows);

      } catch (err) {
        console.error("❌ GET error:", err.message);
        sendJSON(res, 400, { error: "Invalid or failed SQL query", details: err.message });
      } finally {
        await db.end();
      }
    }

    else {
      sendJSON(res, 405, { error: "Method not allowed" });
    }

  } catch (err) {
    console.error("❌ Fatal server error:", err.message);
    sendJSON(res, 500, { error: "Internal server error", details: err.message });
  }
}

initDB().then(() => {
  http.createServer(handleRequest).listen(PORT, () => {
    console.log(`🚀 Server2 running on http://localhost:${PORT}`);
  });
});

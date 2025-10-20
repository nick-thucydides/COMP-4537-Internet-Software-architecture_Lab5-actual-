import dotenv from 'dotenv';
dotenv.config();

import http from "http";
import url from "url";
import { DB_CONFIG } from "./dbconfig.js";
import pg from 'pg';
import { messages } from './lang/en/en.js';

const PORT = 5000;

console.log("Server script loaded");
console.log("DB_CONFIG:", process.env.DB_HOST, process.env.DB_USER);

class DatabaseManager {
  constructor() {
    this.pool = null;
  }

  async init() {
    try {
      // create connection pool
      this.pool = new pg.Pool(DB_CONFIG);

      // create table
      const conn = await this.pool.connect();

      await conn.query(`
        CREATE TABLE IF NOT EXISTS patient (
          patientid SERIAL PRIMARY KEY,
          name VARCHAR(100),
          dateOfBirth TIMESTAMP
        );
      `);
      conn.release();

      // TODO: replace both HC strings
      console.log("Database & table ready");
    } catch (err) {
      console.error("FATAL: Database init failed:", err.message);
      process.exit(1);
    }
  }

  isQueryAllowed(query) {
    const q = query.trim().toUpperCase();

    // Block malicious operations
    // TODO

    // only SELECT or INSERT
    if (!q.startsWith("SELECT") && !q.startsWith("INSERT")) {
      return false;
    }
    return true;
  }

  async executeQuery(query) {
    const conn = await this.pool.connect();
    const result = await conn.query(query);
    conn.release();
    return result.rows;
  }
}

class ResponseHandler {
  static sendJSON(res, status, obj) {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(obj));
  }

  static sendOptions(res) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
  }
}

class RequestHandler {
  constructor(dbManager) {
    this.db = dbManager;
  }

  async handleRequest(req, res) {
    const parsed = url.parse(req.url, true);
    const method = req.method;

    if (method === "OPTIONS") {
      ResponseHandler.sendOptions(res);
      return;
    }

    try {
      if (method === "POST") {
        await this.handlePost(req, res);
      } else if (method === "GET") {
        await this.handleGet(parsed, res);
      } else {
        // TODO
        ResponseHandler.sendJSON(res, 405, { error: "Method not allowed" });
      }
    } catch (err) {
      // TODO
      console.error("Fatal server error:", err.message);
      ResponseHandler.sendJSON(res, 500, { error: "Internal server error", details: err.message });
    }
  }

  async handlePost(req, res) {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const query = data.query;

        // TODO: string
        if (!query) {
          return ResponseHandler.sendJSON(res, 400, { error: "No query provided" });
        }

        // TODO: string
        if (!this.db.isQueryAllowed(query)) {
          return ResponseHandler.sendJSON(res, 403, { error: "Operation not allowed" });
        }

        const result = await this.db.executeQuery(query);

        // TODO: stromg
        ResponseHandler.sendJSON(res, 200, { message: "Query executed successfully", result });

        // TODO: strings
      } catch (err) {
        console.error(" POST error:", err.message);
        ResponseHandler.sendJSON(res, 400, { error: "Invalid or failed SQL query", details: err.message });
      }
    });
  }

  async handleGet(parsed, res) {
    try {
      const q = parsed.query.query;
      // TODO
      if (!q) return ResponseHandler.sendJSON(res, 400, { error: "Missing sql query" });

      //TODO
      if (!this.db.isQueryAllowed(q)) {
        return ResponseHandler.sendJSON(res, 403, { error: "Operation not allowed. Only SELECT and INSERT allowed." });
      }

      const rows = await this.db.executeQuery(q);
      ResponseHandler.sendJSON(res, 200, { success: true, message: "Query executed successfully", data: rows });

    } catch (err) {
      // TODO
      console.error("GET error:", err.message);
      ResponseHandler.sendJSON(res, 400, { error: "Invalid or failed SQL query", details: err.message });
    }
  }
}

const dbManager = new DatabaseManager();
const requestHandler = new RequestHandler(dbManager);

dbManager.init().then(() => {
  http.createServer((req, res) => requestHandler.handleRequest(req, res)).listen(PORT, () => {
    console.log(`Server2 running on http://localhost:${PORT}`);
    console.log(`GET endpoint: http://localhost:${PORT}/?query=SELECT%20*%20FROM%20patient`);
    console.log(`POST endpoint: http://localhost:${PORT}/`);
  });
});
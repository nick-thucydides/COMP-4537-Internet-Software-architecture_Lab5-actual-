import dotenv from 'dotenv';
dotenv.config();

import http from "http";
import url from "url";
import { DB_CONFIG } from "./dbconfig.js";
import pg from 'pg';
import { messages } from './lang/en/en.js';

const PORT = 5000;

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


      console.log(messages.READY);
    } catch (err) {
      console.error(messages.FATAL_DB_ERROR, err.message);
      process.exit(1);
    }
  }

  isQueryAllowed(query) {
    const q = query.trim().toUpperCase();

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
      "Access-Control-Allow-Origin": "https://4537-lab5-m13.netlify.app",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(obj));
  }

  static sendOptions(res) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "https://4537-lab5-m13.netlify.app",
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
        ResponseHandler.sendJSON(res, 405, { error: messages.WRONG_METHOD });
      }
    } catch (err) {
      ResponseHandler.sendJSON(res, 500, { error: messages.SERVER_ERROR, details: err.message });
    }
  }

  async handlePost(req, res) {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const query = data.query;

        if (!query) {
          return ResponseHandler.sendJSON(res, 400, { error: messages.NO_QUERY });
        }


        if (!this.db.isQueryAllowed(query)) {
          return ResponseHandler.sendJSON(res, 403, { error: messages.NOT_ALLOWED });
        }

        const result = await this.db.executeQuery(query);


        ResponseHandler.sendJSON(res, 200, { message: messages.SUCCESS, result });


      } catch (err) {

        ResponseHandler.sendJSON(res, 400, { error: INVALID_QUERY, details: err.message });
      }
    });
  }

  async handleGet(parsed, res) {
    try {
      const q = parsed.query.query;

      if (!q) return ResponseHandler.sendJSON(res, 400, { error: messages.MISSING_QUERY });

      if (!this.db.isQueryAllowed(q)) {
        return ResponseHandler.sendJSON(res, 403, { error: messages.NOT_ALLOWED });
      }

      const rows = await this.db.executeQuery(q);
      ResponseHandler.sendJSON(res, 200, { success: true, message: messages.SUCCESS, data: rows });

    } catch (err) {
      ResponseHandler.sendJSON(res, 400, { error: messages.INVALID_QUERY, details: err.message });
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
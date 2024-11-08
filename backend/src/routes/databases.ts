import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const databaseRoute = Router();

// Helper function to run SQL queries
async function runSQLQuery(req: Request, res: Response) {
  const projectRef = req.params.ref;
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "SQL query is required" });
  }

  const supabaseApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  try {
    const response = await fetch(supabaseApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to execute SQL query",
        error: response.statusText,
      });
    }

    const data = await response.json();
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

// Define the route to run SQL queries
databaseRoute.post("/projects/:ref/database/query", runSQLQuery);

export { databaseRoute };

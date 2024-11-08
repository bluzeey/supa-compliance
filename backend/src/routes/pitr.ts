import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const pitrRoute = Router();

// Function to check PITR status
async function checkPitrStatus(req: Request, res: Response) {
  const projectRef = req.params.ref; // Get project reference from the path
  const supabaseApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/backups`;
  const accessToken = req.cookies["access_token"] || req.session?.access_token; // Ensure this token has the required permissions
  try {
    const response = await fetch(supabaseApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Provide the access token
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: `Failed to fetch backups for project ${projectRef}`,
        error: response.statusText,
      });
    }

    const data = await response.json();
    const pitrEnabled = data.pitr_enabled;

    return res.status(200).json({
      projectRef,
      pitr_enabled: pitrEnabled,
      data,
    });
  } catch (error) {
    console.error("Error fetching PITR status:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

// Define the endpoint and pass req, res to the function
pitrRoute.get("/projects/:ref/pitr-status", (req, res) => {
  checkPitrStatus(req, res);
});

export { pitrRoute };

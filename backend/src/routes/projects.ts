import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const projectRoute = Router();

async function fetchProjects(req: Request, res: Response) {
  // Retrieve the access token from cookies or session storage
  const accessToken = req.cookies["access_token"] || req.session?.access_token;

  if (!accessToken) {
    return res.status(401).send("Unauthorized: No access token found");
  }
  console.log(accessToken);

  try {
    // Call Supabase API to get the list of projects
    const response = await fetch("https://api.supabase.com/v1/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const projects = await response.json();
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Route handler that calls fetchProjects
projectRoute.get("/", (req, res) => {
  fetchProjects(req, res);
});

export { projectRoute };

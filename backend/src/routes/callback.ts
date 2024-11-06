import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const callbackRoute = Router();

async function handleCallback(req: Request, res: Response) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Authorization code not provided");
  }

  try {
    const codeVerifier = req.cookies["supabase_code_verifier"];
    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    const tokenResponse = await fetch(
      "https://api.supabase.com/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.SUPA_CONNECT_CLIENT_ID,
          redirect_uri: process.env.SUPA_REDIRECT_URI,
          code,
          code_verifier: codeVerifier,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Token exchange failed with status ${tokenResponse.status}`
      );
    }

    const tokens = await tokenResponse.json();
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).send("Failed to handle callback");
  }
}

callbackRoute.get("/", (req, res, next) => {
  handleCallback(req, res);
  next();
});

export { callbackRoute };

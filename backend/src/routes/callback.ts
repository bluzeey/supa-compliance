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
      return res.status(400).send("Code verifier not found");
    }

    // Construct the URL-encoded body
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append(
      "client_id",
      process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID || ""
    );
    params.append(
      "client_secret",
      process.env.NEXT_PUBLIC_SUPABASE_CLIENT_SECRET || ""
    );
    params.append("redirect_uri", "http://localhost:8000/callback" || "");
    params.append("code", code);
    params.append("code_verifier", codeVerifier);

    console.log("Sending payload:", params.toString());

    const tokenResponse = await fetch(
      "https://api.supabase.com/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return res.status(422).send(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    return res.redirect("http://localhost:3000/dashboard");
  } catch (error) {
    console.error("Error handling callback:", error);
    if (!res.headersSent) {
      res.status(500).send("Failed to handle callback");
    }
  }
}

callbackRoute.get("/", (req, res, next) => {
  handleCallback(req, res).catch(next);
});

export { callbackRoute };

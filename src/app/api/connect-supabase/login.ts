// pages/api/connect-supabase/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const config = {
  clientId: process.env.NEXT_PUBLIC_SUPA_CONNECT_CLIENT_ID!,
  authorizationEndpointUri: "https://api.supabase.com/v1/oauth/authorize",
  redirectUri: process.env.NEXT_PUBLIC_SUPA_REDIRECT_URI!,
};

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Store codeVerifier in a secure cookie or session
    res.setHeader(
      "Set-Cookie",
      `supabase_code_verifier=${codeVerifier}; Path=/; HttpOnly; Secure`
    );

    const authorizationUrl = `${config.authorizationEndpointUri}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(
      config.redirectUri
    )}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    // Return the URL as a JSON response
    res.status(200).json({ authorizationUrl });
  } catch (error) {
    console.error("Error generating authorization URL:", error);
    res.status(500).json({ error: "Failed to initiate OAuth flow" });
  }
}

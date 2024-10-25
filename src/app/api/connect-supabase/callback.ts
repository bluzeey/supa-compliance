// pages/api/connect-supabase/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { SupabaseManagementAPI } from "supabase-management-js";
import fetch from "node-fetch";

const config = {
  clientId: process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID!,
  clientSecret: process.env.SUPA_CONNECT_CLIENT_SECRET!,
  tokenUri: "https://api.supabase.com/v1/oauth/token",
  redirectUri: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI!,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const codeVerifier = req.cookies.supabase_code_verifier;

  if (!code || !codeVerifier) {
    return res.status(400).json({ error: "Invalid OAuth flow" });
  }

  const tokenResponse = await fetch(config.tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${config.clientId}:${config.clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const tokens:any = await tokenResponse.json();

  const supaManagementClient = new SupabaseManagementAPI({
    accessToken: tokens.access_token,
  });

  const projects = await supaManagementClient.getProjects();

  res.redirect(`/dashboard?projects=${encodeURIComponent(JSON.stringify(projects))}`);
}

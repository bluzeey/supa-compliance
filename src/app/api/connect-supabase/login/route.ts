import { NextResponse } from "next/server";
import crypto from "crypto";

const config = {
  clientId: process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID!,
  authorizationEndpointUri: "https://api.supabase.com/v1/oauth/authorize",
  redirectUri: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI!,
};

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export async function GET() {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authorizationUrl = `${config.authorizationEndpointUri}?client_id=${
      config.clientId
    }&redirect_uri=${encodeURIComponent(
      config.redirectUri
    )}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    // Create a response with the authorization URL
    const response = NextResponse.json({ authorizationUrl });

    // Set the code verifier as a secure cookie
    response.cookies.set("supabase_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error generating authorization URL:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}

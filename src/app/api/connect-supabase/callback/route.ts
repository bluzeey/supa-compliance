import { NextRequest, NextResponse } from "next/server";
import { SupabaseManagementAPI } from "supabase-management-js";

const config = {
  clientId: process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_SUPABASE_CLIENT_SECRET!,
  tokenUri: "https://api.supabase.com/v1/oauth/token",
  redirectUri: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI!,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const codeVerifier = request.cookies.get("supabase_code_verifier")?.value;

  if (!code || !codeVerifier) {
    return NextResponse.json({ error: "Invalid OAuth flow" }, { status: 400 });
  }

  try {
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

    if (!tokenResponse.ok) {
      throw new Error("Failed to retrieve access token");
    }

    const tokens: any = await tokenResponse.json();

    const supaManagementClient = new SupabaseManagementAPI({
      accessToken: tokens.access_token,
    });

    const projects = await supaManagementClient.getProjects();

    // Create a response that redirects to the dashboard
    const response = NextResponse.redirect(
      new URL(
        `/dashboard?projects=${encodeURIComponent(JSON.stringify(projects))}`,
        request.url
      )
    );

    // Clear the code verifier cookie
    response.cookies.set("supabase_code_verifier", "", { maxAge: 0 });

    // Set the access token as a secure HttpOnly cookie
    response.cookies.set("supabase_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokens.expires_in,
    });

    return response;
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.json(
      { error: "OAuth callback failed" },
      { status: 500 }
    );
  }
}

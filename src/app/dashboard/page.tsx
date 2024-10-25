"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      exchangeCodeForToken(code).then((accessToken) => {
        fetchSupabaseProjects(accessToken);
        router.replace("/dashboard");
      });
    } else {
      const storedToken = localStorage.getItem("supabase_access_token");
      if (storedToken) fetchSupabaseProjects(storedToken);
    }
  }, [router]);

  const handleConnectSupabase = async () => {
    const { codeVerifier, codeChallenge } =
      await generateCodeVerifierAndChallenge();
    localStorage.setItem("supabase_code_verifier", codeVerifier);

    const clientId = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI + "/dashboard";

    const authorizationUrl = `https://api.supabase.com/v1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=all&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authorizationUrl;
  };

  const exchangeCodeForToken = async (code) => {
    const codeVerifier = localStorage.getItem("supabase_code_verifier");
    const response = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID}:${process.env.NEXT_PUBLIC_SUPABASE_CLIENT_SECRET}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri:
          process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI + "/dashboard",
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await response.json();
    localStorage.setItem("supabase_access_token", tokens.access_token);
    localStorage.setItem("supabase_refresh_token", tokens.refresh_token);
    return tokens.access_token;
  };

  const fetchSupabaseProjects = async (accessToken) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.supabase.com/v1/projects", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const projects = await response.json();
      setProjects(projects);
    } catch (error) {
      console.error("Error fetching Supabase projects:", error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      {/* Button to connect Supabase */}
      <Button onClick={handleConnectSupabase}>
        <Plus className="mr-2 h-4 w-4" /> Connect Supabase
      </Button>
      {/* Render project details */}
    </div>
  );
}

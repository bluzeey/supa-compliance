"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { Project } from "../../../lib/definitions";
import { Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        router.push("/login");
        return;
      }
      const userId = user.data.user.id;

      // Fetch user's local projects
      const { data, error } = await supabase
        .schema("supabase")
        .from("projects")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [router]);

  // Handle Supabase OAuth Flow
  const handleConnectSupabase = async () => {
    // Replace with your Supabase OAuth URL and add your app's redirect_uri
    const clientId = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI;

    const authorizationUrl = `https://api.supabase.com/v1/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=all&state=randomState`; // add PKCE if needed

    // Redirect the user to the Supabase OAuth page
    window.location.href = authorizationUrl;
  };

  const fetchSupabaseProjects = async (accessToken: string) => {
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
  };

  const addProject = async () => {
    setIsAddingProject(true);
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .schema("supabase")
      .from("projects")
      .insert([
        {
          user_id: user.data.user.id,
          project_name: projectName,
          supabase_api_key: apiKey,
        },
      ]);

    if (error) {
      console.error("Error adding project:", error);
    } else {
      setProjects([...projects]);
      setProjectName("");
      setApiKey("");
    }
    setIsAddingProject(false);
  };

  const handleComplianceCheck = (project: Project) => {
    console.log("Running compliance check for", project.project_name);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <main className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Projects</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Supabase Project</DialogTitle>
                  <DialogDescription>
                    Enter your project details to add it to the dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-name" className="text-right">
                      Project Name
                    </Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="api-key" className="text-right">
                      API Key
                    </Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addProject} disabled={isAddingProject}>
                    {isAddingProject && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mb-4">
            {/* Add Supabase OAuth Button */}
            <Button onClick={handleConnectSupabase}>
              <Plus className="mr-2 h-4 w-4" /> Connect Supabase
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.project_name}</CardTitle>
                    <CardDescription>
                      API Key: {project.supabase_api_key.slice(0, 8)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add more project details or status information here */}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleComplianceCheck(project)}
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Run Compliance
                      Check
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No projects added yet</CardTitle>
                <CardDescription>
                  Add your first Supabase project to get started.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

// pages/dashboard.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
};

const DashboardContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const projectsParam = searchParams.get("projects");
    if (projectsParam) {
      const projectsData = JSON.parse(decodeURIComponent(projectsParam));
      setProjects(projectsData);
    }
  }, [searchParams]);

  const handleConnectSupabase = async () => {
    try {
      const response = await fetch("/api/connect-supabase/login");
  
      // Check if response is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("Authorization URL not returned from API");
      }
    } catch (error) {
      console.error("Error initiating OAuth flow:", error);
      alert("Failed to initiate OAuth flow. Please try again.");
    }
  };

  
  return (
    <div className="container mx-auto p-8">
      <Button onClick={handleConnectSupabase}>Connect Supabase</Button>
      {projects.length > 0 ? (
        <ul className="mt-8">
          {projects.map((project) => (
            <li key={project.id} className="p-2 border-b border-gray-300">
              {project.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8">No projects available. Please connect Supabase.</p>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;

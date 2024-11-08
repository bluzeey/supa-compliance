"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
  is_default: boolean;
  status: string;
  created_at: string;
};

type Member = {
  user_id: string;
  user_name: string;
  email: string;
  role_name: string;
  mfa_enabled: boolean;
};

type Organization = {
  id: string;
  name: string;
  members: Member[];
};

const DashboardContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pitrStatus, setPitrStatus] = useState<{ [key: string]: boolean }>({});
  const [branches, setBranches] = useState<{ [key: string]: Branch[] }>({});
  const [databases, setDatabases] = useState<string[]>([]);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:8000/projects", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch projects. Status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("http://localhost:8000/organizations", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch organizations. Status: ${response.status}`
        );
      }
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchPitrStatus = async (projectRef: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/pitr/projects/${projectRef}/pitr-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch PITR status. Status: ${response.status}`);
      }
      const data = await response.json();
      setPitrStatus((prev) => ({
        ...prev,
        [projectRef]: data.pitr_enabled,
      }));
    } catch (error) {
      console.error(`Error fetching PITR status for project ${projectRef}:`, error);
    }
  };

  const fetchDatabases = async (projectRef: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/projects/${projectRef}/database/get-databases`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch databases. Status: ${response.status}`);
      }
      const data = await response.json();
      setDatabases(data || []);
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  };

  const fetchSchemas = async (projectRef: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/projects/${projectRef}/database/get-schemas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch schemas. Status: ${response.status}`);
      }
      const data = await response.json();
      setSchemas(data || []);
    } catch (error) {
      console.error("Error fetching schemas:", error);
    }
  };

  const handleConnectSupabase = () => {
    window.location.href = "http://localhost:8000/login";
  };

  useEffect(() => {
    fetchProjects();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    projects.forEach((project) => {
      fetchPitrStatus(project.id);
      fetchDatabases(project.id);  // Fetch databases for each project
      fetchSchemas(project.id);    // Fetch schemas for each project
    });
  }, [projects]);

  return (
    <div className="container mx-auto p-8">
      <Button onClick={handleConnectSupabase} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect Supabase"}
      </Button>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">
          Projects, PITR Status, and Branches
        </h2>
        {projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="p-2 border-b border-gray-300">
                <p>Name: {project.name}</p>
                <p>PITR Enabled: {pitrStatus[project.id] ? "Yes" : "No"}</p>

                <h4 className="mt-2 text-lg font-semibold">Branches:</h4>
              </li>
            ))}
          </ul>
        ) : (
          <p>No projects available. Please connect Supabase.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Databases</h2>
        <ul>
          {databases.map((db, index) => (
            <li key={index} className="p-2 border-b border-gray-300">{db}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Schemas</h2>
        <ul>
          {schemas.map((schema, index) => (
            <li key={index} className="p-2 border-b border-gray-300">{schema}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Organizations and Members</h2>
        {organizations.length > 0 ? (
          <div>
            {organizations.map((org) => (
              <div key={org.id} className="mb-4 p-4 border border-gray-300">
                <h3 className="text-lg font-bold">{org.name}</h3>
                <ul className="mt-2">
                  {org.members.map((member) => (
                    <li
                      key={member.user_id}
                      className="p-2 border-b border-gray-200"
                    >
                      <p>Name: {member.user_name}</p>
                      <p>Email: {member.email}</p>
                      <p>Role: {member.role_name}</p>
                      <p>MFA Enabled: {member.mfa_enabled ? "Yes" : "No"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No organizations available. Please connect Supabase.</p>
        )}
      </div>
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

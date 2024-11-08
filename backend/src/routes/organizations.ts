import { Router, Request, Response } from "express";
import fetch from "node-fetch";

const organizationRoute = Router();

async function fetchOrganizations(req: Request, res: Response) {
  const accessToken = req.cookies["access_token"] || req.session?.access_token;

  if (!accessToken) {
    console.error("No access token found.");
    return res.status(401).send("Unauthorized: No access token found");
  }

  try {
    // Fetch organizations
    const orgResponse = await fetch(
      "https://api.supabase.com/v1/organizations",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!orgResponse.ok) {
      console.error(`Failed to fetch organizations: ${orgResponse.statusText}`);
      throw new Error(
        `Failed to fetch organizations: ${orgResponse.statusText}`
      );
    }

    const organizations = await orgResponse.json();

    // Fetch members for each organization
    const orgDetails = await Promise.all(
      organizations.map(async (org: { id: string; name: string }) => {
        const memberResponse = await fetch(
          `https://api.supabase.com/v1/organizations/${org.id}/members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!memberResponse.ok) {
          console.error(
            `Failed to fetch members for org ${org.name}: ${memberResponse.statusText}`
          );
          throw new Error(
            `Failed to fetch members for org ${org.name}: ${memberResponse.statusText}`
          );
        }

        const members = await memberResponse.json();

        return {
          organization: { id: org.id, name: org.name },
          members: members.map((member: any) => ({
            user_id: member.user_id,
            user_name: member.user_name,
            email: member.email,
            role_name: member.role_name,
            mfa_enabled: member.mfa_enabled,
          })),
        };
      })
    );

    return res.status(200).json(orgDetails);
  } catch (error) {
    console.error("Error fetching organization or member data:", error);
    res.status(500).send("Internal Server Error");
  }
}

organizationRoute.get("/", (req, res) => {
  fetchOrganizations(req, res);
});

export { organizationRoute };

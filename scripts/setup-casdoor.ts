/**
 * Setup Casdoor organization and admin user.
 * 
 * This script initializes Casdoor with:
 * 1. An organization (default: "primebrick")
 * 2. An admin user with the "Administrators" role
 * 
 * Run after Casdoor is ready: pnpm run setup:casdoor
 */

import "dotenv/config";

interface CasdoorUser {
  name: string;
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  address?: string;
  affiliation?: string;
  score?: number;
  ranking?: number;
  isOnline?: boolean;
  isAdmin?: boolean;
  isGlobalAdmin?: boolean;
  forbidden?: boolean;
  deleted?: boolean;
  signupApplication?: string;
  createdTime?: string;
  tags?: string[];
  properties?: Record<string, unknown>;
}

interface CasdoorOrganization {
  owner: string;
  name: string;
  displayName: string;
  websiteUrl?: string;
  favicon?: string;
  passwordType?: string;
  phonePrefix?: string;
  defaultAvatar?: string;
  language?: string;
  app?: string;
  enableSoftDeletion?: boolean;
}

interface CasdoorRole {
  owner: string;
  name: string;
  users?: string[];
  roles?: string[];
  permissions?: string[];
}

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "primebrick-api";
const CASDOOR_CLIENT_SECRET = process.env.CASDOOR_CLIENT_SECRET || "change-me";
const CASDOOR_ADMIN_USERNAME = process.env.CASDOOR_ADMIN_USERNAME || "admin";
const CASDOOR_ADMIN_EMAIL = process.env.CASDOOR_ADMIN_EMAIL || "admin@primebrick.local";
const CASDOOR_ADMIN_PASSWORD = process.env.CASDOOR_ADMIN_PASSWORD || "Admin123!";
const CASDOOR_ORGANIZATION = process.env.CASDOOR_ORGANIZATION || "primebrick";

async function casdoorRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  data?: unknown
): Promise<T> {
  const url = `${CASDOOR_ENDPOINT}/api/${path}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${await getJwtToken()}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Casdoor API error (${response.status}): ${text}`);
  }

  return response.json();
}

async function getJwtToken(): Promise<string> {
  const url = `${CASDOOR_ENDPOINT}/api/login/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CASDOOR_CLIENT_ID,
    client_secret: CASDOOR_CLIENT_SECRET,
    scope: "",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get JWT token: ${text}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function createOrganization(): Promise<void> {
  console.log(`Creating organization: ${CASDOOR_ORGANIZATION}`);

  const org: CasdoorOrganization = {
    owner: "admin",
    name: CASDOOR_ORGANIZATION,
    displayName: "Primebrick",
    websiteUrl: "https://primebrick.io",
  };

  try {
    await casdoorRequest("POST", "create-organization", org);
    console.log(`✓ Organization created: ${CASDOOR_ORGANIZATION}`);
  } catch (error) {
    if ((error as Error).message.includes("already exists")) {
      console.log(`✓ Organization already exists: ${CASDOOR_ORGANIZATION}`);
    } else {
      throw error;
    }
  }
}

async function createRole(): Promise<void> {
  console.log(`Creating role: Administrators`);

  const role: CasdoorRole = {
    owner: CASDOOR_ORGANIZATION,
    name: "Administrators",
  };

  try {
    await casdoorRequest("POST", "add-role", role);
    console.log(`✓ Role created: Administrators`);
  } catch (error) {
    if ((error as Error).message.includes("already exists")) {
      console.log(`✓ Role already exists: Administrators`);
    } else {
      throw error;
    }
  }
}

async function createAdminUser(): Promise<void> {
  console.log(`Creating admin user: ${CASDOOR_ADMIN_USERNAME}`);

  const user: CasdoorUser = {
    name: CASDOOR_ADMIN_USERNAME,
    displayName: "Primebrick Admin",
    email: CASDOOR_ADMIN_EMAIL,
    password: CASDOOR_ADMIN_PASSWORD,
    isAdmin: true,
  };

  try {
    await casdoorRequest("POST", "add-user", user);
    console.log(`✓ Admin user created: ${CASDOOR_ADMIN_USERNAME} (${CASDOOR_ADMIN_EMAIL})`);
  } catch (error) {
    if ((error as Error).message.includes("already exists")) {
      console.log(`✓ Admin user already exists: ${CASDOOR_ADMIN_USERNAME}`);
    } else {
      throw error;
    }
  }
}

async function addUserToRole(): Promise<void> {
  console.log(`Adding user to role: ${CASDOOR_ADMIN_USERNAME} -> Administrators`);

  try {
    await casdoorRequest("POST", "add-user-to-role", {
      owner: CASDOOR_ORGANIZATION,
      name: "Administrators",
      users: [CASDOOR_ADMIN_USERNAME],
    });
    console.log(`✓ User added to role: ${CASDOOR_ADMIN_USERNAME} -> Administrators`);
  } catch (error) {
    if ((error as Error).message.includes("already exists")) {
      console.log(`✓ User already in role: ${CASDOOR_ADMIN_USERNAME} -> Administrators`);
    } else {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  console.log("Setting up Casdoor...");
  console.log(`Endpoint: ${CASDOOR_ENDPOINT}`);
  console.log(`Organization: ${CASDOOR_ORGANIZATION}`);
  console.log(`Admin user: ${CASDOOR_ADMIN_USERNAME} (${CASDOOR_ADMIN_EMAIL})`);
  console.log("");

  try {
    await createOrganization();
    await createRole();
    await createAdminUser();
    await addUserToRole();

    console.log("");
    console.log("✓ Casdoor setup complete!");
    console.log("");
    console.log("You can now login with:");
    console.log(`  Username: ${CASDOOR_ADMIN_USERNAME}`);
    console.log(`  Email: ${CASDOOR_ADMIN_EMAIL}`);
    console.log(`  Password: ${CASDOOR_ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("Error setting up Casdoor:", error);
    process.exit(1);
  }
}

main();

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
  owner: string;
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

interface CasdoorApplication {
  owner: string;
  name: string;
  displayName: string;
  logo?: string;
  homepageUrl?: string;
  description?: string;
  organization?: string;
  enablePassword?: boolean;
  enableSignUp?: boolean;
  enableCodeSignin?: boolean;
  enablePhoneSignin?: boolean;
  enableEmailSignin?: boolean;
  enableWebAuthn?: boolean;
}

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "primebrick-api";
const CASDOOR_ADMIN_USERNAME = process.env.CASDOOR_ADMIN_USERNAME || "admin";
const CASDOOR_ADMIN_EMAIL = process.env.CASDOOR_ADMIN_EMAIL || "admin@acme.local";
const CASDOOR_ADMIN_PASSWORD = process.env.CASDOOR_ADMIN_PASSWORD || "admin";
const CASDOOR_ORGANIZATION = process.env.CASDOOR_ORGANIZATION || "ACME";
const CASDOOR_INITIAL_ADMIN = "admin";
const CASDOOR_INITIAL_PASSWORD = "123";
const CASDOOR_BUILTIN_CLIENT_ID = "cb05577e2097c31af3c7";
const CASDOOR_BUILTIN_CLIENT_SECRET = "47b2e05673a5307ccf0552e32ba45a18f6627f21";

let clientSecret: string | null = null;
let jwtToken: string | null = null;

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
  if (jwtToken) {
    return jwtToken;
  }

  // Use OAuth password grant with built-in application credentials
  const url = `${CASDOOR_ENDPOINT}/api/login/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: CASDOOR_BUILTIN_CLIENT_ID,
    client_secret: CASDOOR_BUILTIN_CLIENT_SECRET,
    username: CASDOOR_INITIAL_ADMIN,
    password: CASDOOR_INITIAL_PASSWORD,
    scope: "openid profile email",
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
  jwtToken = data.access_token;
  return jwtToken;
}

async function getOrCreateApplication(): Promise<string> {
  console.log(`Getting or creating application: ${CASDOOR_CLIENT_ID}`);

  const app: CasdoorApplication = {
    owner: CASDOOR_ORGANIZATION,
    name: CASDOOR_CLIENT_ID,
    displayName: "Primebrick API",
    organization: CASDOOR_ORGANIZATION,
    enablePassword: true,
    enableSignUp: false,
  };

  try {
    // Try to get existing application
    const existingApp = await casdoorRequest<CasdoorApplication>(
      "GET",
      `get-application?owner=${CASDOOR_ORGANIZATION}&name=${CASDOOR_CLIENT_ID}`
    );
    console.log(`✓ Application exists: ${CASDOOR_CLIENT_ID}`);
    return existingApp.name;
  } catch (error) {
    // Application doesn't exist, create it
    try {
      await casdoorRequest("POST", "add-application", app);
      console.log(`✓ Application created: ${CASDOOR_CLIENT_ID}`);
      return CASDOOR_CLIENT_ID;
    } catch (createError) {
      throw new Error(`Failed to create application: ${(createError as Error).message}`);
    }
  }
}

async function getClientSecret(): Promise<string> {
  if (clientSecret) {
    return clientSecret;
  }

  // Get application details which includes the client secret
  const app = await casdoorRequest<{ clientSecret?: string }>(
    "GET",
    `get-application?owner=${CASDOOR_ORGANIZATION}&name=${CASDOOR_CLIENT_ID}`
  );

  if (!app.clientSecret) {
    // Generate a new client secret for the application
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await casdoorRequest("POST", "update-application", {
      ...app,
      clientSecret: secret,
    });
    clientSecret = secret;
    console.log(`✓ Client secret generated for application: ${CASDOOR_CLIENT_ID}`);
  } else {
    clientSecret = app.clientSecret;
    console.log(`✓ Client secret retrieved for application: ${CASDOOR_CLIENT_ID}`);
  }
  return clientSecret;
}

async function createOrganization(): Promise<void> {
  console.log(`Creating organization: ${CASDOOR_ORGANIZATION}`);

  const org: CasdoorOrganization = {
    owner: "admin",
    name: CASDOOR_ORGANIZATION,
    displayName: CASDOOR_ORGANIZATION,
    websiteUrl: "https://acme.io",
  };

  try {
    await casdoorRequest("POST", "add-organization", org);
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
    owner: CASDOOR_ORGANIZATION,
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
    // Update the user directly with the role
    await casdoorRequest("POST", "update-user", {
      owner: CASDOOR_ORGANIZATION,
      name: CASDOOR_ADMIN_USERNAME,
      roles: ["Administrators"],
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

async function enableGrantTypes(): Promise<void> {
  console.log("Enabling OAuth grant types on built-in application...");

  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(
    "UPDATE application SET grant_types = '[\"password\", \"authorization_code\", \"client_credentials\"]' WHERE name = 'app-built-in'"
  );
  console.log("✓ Grant types enabled on built-in application");
  await pool.end();
}

async function main(): Promise<void> {
  console.log("Setting up Casdoor...");
  console.log(`Endpoint: ${CASDOOR_ENDPOINT}`);
  console.log(`Organization: ${CASDOOR_ORGANIZATION}`);
  console.log(`Admin user: ${CASDOOR_ADMIN_USERNAME} (${CASDOOR_ADMIN_EMAIL})`);
  console.log("");

  try {
    await enableGrantTypes();
    await createOrganization();
    await getOrCreateApplication();
    const secret = await getClientSecret();
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
    console.log("");
    console.log("Configure your backend with:");
    console.log(`  OIDC_CLIENT_ID: ${CASDOOR_CLIENT_ID}`);
    console.log(`  OIDC_CLIENT_SECRET: ${secret}`);
  } catch (error) {
    console.error("Error setting up Casdoor:", error);
    process.exit(1);
  }
}

main();

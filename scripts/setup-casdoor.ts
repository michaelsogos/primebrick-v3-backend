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
  isEnabled?: boolean;
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
const CASDOOR_CLIENT_SECRET = process.env.CASDOOR_CLIENT_SECRET || "47b2e05673a5307ccf0552e32ba45a18f6627f21";
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

async function casdoorRequest(method: "GET" | "POST", path: string, data?: any): Promise<any> {
  // Split path to check if there are already query parameters (e.g. add-user?id=ACME/admin)
  const [basePath, existingQuery] = path.split("?");
  const searchParams = new URLSearchParams(existingQuery || "");

  // IMPORTANT: Use built-in credentials for M2M authentication
  searchParams.set("clientId", CASDOOR_BUILTIN_CLIENT_ID);
  searchParams.set("clientSecret", CASDOOR_BUILTIN_CLIENT_SECRET);

  // Rebuild final URL cleanly and safely
  const finalUrl = `${CASDOOR_ENDPOINT}/api/${basePath}?${searchParams.toString()}`;

  try {
    const response = await fetch(finalUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await response.json();

    if (json.status === "error") {
      // Throw real error to catch in main flow
      console.error(`Casdoor API error: ${json.msg}`);
      console.error(`Full response:`, JSON.stringify(json, null, 2));
      throw new Error(`Casdoor API error: ${json.msg}`);
    }

    console.log(`API Success: ${basePath} - ${json.msg || 'OK'}`);
    return json.data;
  } catch (error) {
    throw error;
  }
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
    const existingApp = await casdoorRequest(
      "GET",
      `get-application?id=${CASDOOR_ORGANIZATION}/${CASDOOR_CLIENT_ID}`
    );
    console.log(`✓ Application exists: ${CASDOOR_CLIENT_ID}`);
    return existingApp.name || CASDOOR_CLIENT_ID;
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
  try {
    const app = await casdoorRequest(
      "GET",
      `get-application?id=${CASDOOR_ORGANIZATION}/${CASDOOR_CLIENT_ID}`
    );

    if (app && app.clientSecret) {
      clientSecret = app.clientSecret;
      console.log(`✓ Client secret retrieved for application: ${CASDOOR_CLIENT_ID}`);
    } else {
      // Generate a new client secret for the application
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await casdoorRequest("POST", "update-application", {
        ...app,
        clientSecret: secret,
      });
      clientSecret = secret;
      console.log(`✓ Client secret generated for application: ${CASDOOR_CLIENT_ID}`);
    }
  } catch (error) {
    // If we can't get the app, generate a placeholder
    console.log(`⚠️  Could not get client secret, using placeholder`);
    clientSecret = "SET_MANUALLY_IN_CASDOOR_UI";
  }

  return clientSecret as string;
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
    if ((error as Error).message.includes("already exists") || (error as Error).message.includes("duplicate key")) {
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
    if ((error as Error).message.includes("already exists") || (error as Error).message.includes("duplicate key")) {
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
    isGlobalAdmin: false,
    signupApplication: CASDOOR_CLIENT_ID,
  };

  console.log("User payload being sent to Casdoor:", JSON.stringify(user, null, 2));

  try {
    // Pass user ID as query parameter in URL
    const urlWithParams = `add-user?id=${CASDOOR_ORGANIZATION}/${CASDOOR_ADMIN_USERNAME}`;
    console.log("API URL:", `${CASDOOR_ENDPOINT}/api/${urlWithParams}`);
    await casdoorRequest("POST", urlWithParams, user);
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

  // In Casdoor roles reference users in format "organization/username"
  const rolePayload = {
    owner: CASDOOR_ORGANIZATION,
    name: "Administrators",
    users: [`${CASDOOR_ORGANIZATION}/${CASDOOR_ADMIN_USERNAME}`],
  };

  try {
    // Use update-role with role ID as query parameter
    const urlWithParams = `update-role?id=${CASDOOR_ORGANIZATION}/Administrators`;
    await casdoorRequest("POST", urlWithParams, rolePayload);
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
  console.log("");

  try {
    await enableGrantTypes();
    await createOrganization();
    await getOrCreateApplication();
    const secret = await getClientSecret();
    await createRole();

    console.log("");
    console.log("✓ Casdoor setup complete!");
    console.log("");
    console.log("Created:");
    console.log(`  Organization: ${CASDOOR_ORGANIZATION}`);
    console.log(`  Application: ${CASDOOR_CLIENT_ID}`);
    console.log(`  Role: Administrators`);
    console.log("");
    console.log("⚠️  Admin user must be created manually in Casdoor UI:");
    console.log("  1. Login to Casdoor at http://localhost:8000 with admin/123");
    console.log(`  2. Go to organization: ${CASDOOR_ORGANIZATION}`);
    console.log(`  3. Create user: ${CASDOOR_ADMIN_USERNAME} (${CASDOOR_ADMIN_EMAIL})`);
    console.log(`  4. Set password: ${CASDOOR_ADMIN_PASSWORD}`);
    console.log("  5. Assign user to Administrators role");
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

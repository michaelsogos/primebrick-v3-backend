/**
 * Setup Casdoor organization and admin user using casdoor-nodejs-sdk.
 *
 * This script initializes Casdoor with:
 * 1. An organization (default: "ACME")
 * 2. An OAuth application (default: "primebrick-api")
 * 3. An admin role ("Administrators")
 *
 * Run after Casdoor is ready: pnpm run setup:casdoor
 */

import "dotenv/config";
import * as CasdoorSDK from "casdoor-nodejs-sdk";

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "primebrick-api";
const CASDOOR_ADMIN_USERNAME = process.env.CASDOOR_ADMIN_USERNAME || "admin";
const CASDOOR_ADMIN_EMAIL = process.env.CASDOOR_ADMIN_EMAIL || "admin@acme.local";
const CASDOOR_ADMIN_PASSWORD = process.env.CASDOOR_ADMIN_PASSWORD || "admin";
const CASDOOR_ORGANIZATION = process.env.CASDOOR_ORGANIZATION || "ACME";
const CASDOOR_BUILTIN_CLIENT_ID = "cb05577e2097c31af3c7";
const CASDOOR_BUILTIN_CLIENT_SECRET = "47b2e05673a5307ccf0552e32ba45a18f6627f21";

// Initialize Casdoor SDK
const sdk = new CasdoorSDK.SDK({
  endpoint: CASDOOR_ENDPOINT,
  clientId: CASDOOR_BUILTIN_CLIENT_ID,
  clientSecret: CASDOOR_BUILTIN_CLIENT_SECRET,
  certificate: "",
  orgName: "admin",
});

let clientSecret: string | null = null;

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

async function createOrganization(): Promise<void> {
  console.log(`Creating organization: ${CASDOOR_ORGANIZATION}`);

  const org = {
    owner: "admin",
    name: CASDOOR_ORGANIZATION,
    displayName: CASDOOR_ORGANIZATION,
    websiteUrl: "https://acme.io",
    createdTime: new Date().toISOString(),
    passwordType: "plain",
    initScore: 0,
    enableSoftDeletion: false,
    isProfilePublic: false,
  };

  try {
    await sdk.addOrganization(org);
    console.log(`✓ Organization created: ${CASDOOR_ORGANIZATION}`);
  } catch (error) {
    if ((error as Error).message.includes("already exists") || (error as Error).message.includes("duplicate key")) {
      console.log(`✓ Organization already exists: ${CASDOOR_ORGANIZATION}`);
    } else {
      console.error("Error creating organization:", error);
      throw error;
    }
  }
}

async function getOrCreateApplication(): Promise<string> {
  console.log(`Getting or creating application: ${CASDOOR_CLIENT_ID}`);

  const app = {
    owner: CASDOOR_ORGANIZATION,
    name: CASDOOR_CLIENT_ID,
    displayName: "Primebrick API",
    organization: CASDOOR_ORGANIZATION,
    enablePassword: true,
    enableSignUp: false,
    createdTime: new Date().toISOString(),
    logo: "",
    homepageUrl: "",
    description: "",
  };

  try {
    // Try to get existing application
    const existingApp = await sdk.getApplication(`${CASDOOR_ORGANIZATION}/${CASDOOR_CLIENT_ID}`);
    console.log(`✓ Application exists: ${CASDOOR_CLIENT_ID}`);
    return existingApp.data.data.name || CASDOOR_CLIENT_ID;
  } catch (error) {
    // Application doesn't exist, create it
    try {
      await sdk.addApplication(app);
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
    const appResponse = await sdk.getApplication(`${CASDOOR_ORGANIZATION}/${CASDOOR_CLIENT_ID}`);
    const app = appResponse.data.data;

    // The SDK doesn't return clientSecret in the application object
    // We'll use a placeholder for now
    console.log(`⚠️  Client secret retrieval not supported by SDK, using placeholder`);
    clientSecret = "SET_MANUALLY_IN_CASDOOR_UI";
  } catch (error) {
    // If we can't get the app, generate a placeholder
    console.log(`⚠️  Could not get client secret, using placeholder`);
    clientSecret = "SET_MANUALLY_IN_CASDOOR_UI";
  }

  return clientSecret as string;
}

async function createRole(): Promise<void> {
  console.log(`Creating role: Administrators`);

  const role = {
    owner: CASDOOR_ORGANIZATION,
    name: "Administrators",
    createdTime: new Date().toISOString(),
    displayName: "Administrators",
    description: "Administrators role",
  };

  try {
    await sdk.addRole(role);
    console.log(`✓ Role created: Administrators`);
  } catch (error) {
    if ((error as Error).message.includes("already exists") || (error as Error).message.includes("duplicate key")) {
      console.log(`✓ Role already exists: Administrators`);
    } else {
      console.error("Error creating role:", error);
      throw error;
    }
  }
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

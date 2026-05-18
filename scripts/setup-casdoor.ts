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
import { Pool } from "pg";
import { updateAuthConfig } from "../src/modules/auth/config-repo";

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

async function createAdminUser(): Promise<void> {
  console.log(`Creating admin user: ${CASDOOR_ADMIN_USERNAME}`);

  const user = {
    owner: CASDOOR_ORGANIZATION, // "ACME"
    name: CASDOOR_ADMIN_USERNAME, // "admin"
    displayName: "Primebrick Admin",
    email: CASDOOR_ADMIN_EMAIL,
    password: CASDOOR_ADMIN_PASSWORD,
    isAdmin: true,
    isGlobalAdmin: false,
    signupApplication: CASDOOR_CLIENT_ID,
    createdTime: new Date().toISOString(),
  };

  console.log("User payload being sent to Casdoor:", JSON.stringify(user, null, 2));

  try {
    // CORREZIONE CRUCIALE: Usiamo fetch diretto con auth dell'SDK per forzare l'ID corretto nell'URL query string
    const urlWithParams = `${CASDOOR_ENDPOINT}/api/add-user?id=${CASDOOR_ORGANIZATION}/${CASDOOR_ADMIN_USERNAME}&clientId=${CASDOOR_BUILTIN_CLIENT_ID}&clientSecret=${CASDOOR_BUILTIN_CLIENT_SECRET}`;
    
    const response = await fetch(urlWithParams, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    
    const json = await response.json();
    console.log(`SDK addUser response status:`, json?.status);
    
    // Check if Casdoor returned an error in the response body
    if (json?.status === 'error') {
      throw new Error(`Casdoor API error: ${json.msg}`);
    }
    
    console.log(`✓ Admin user created: ${CASDOOR_ADMIN_USERNAME} (${CASDOOR_ADMIN_EMAIL})`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(`SDK addUser error:`, errorMessage);
    
    if (errorMessage.includes("already exists") || errorMessage.includes("duplicate key")) {
      console.log(`✓ Admin user already exists: ${CASDOOR_ADMIN_USERNAME}`);
    } else {
      console.error("Error creating user:", error);
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

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await enableGrantTypes();
    await createOrganization();
    await getOrCreateApplication();
    const secret = await getClientSecret();
    await createRole();
    await createAdminUser();

    // Save secrets to database
    console.log("");
    console.log("Saving configuration to database...");
    await updateAuthConfig(pool, "oidc_client_secret", secret, "setup-casdoor");
    await updateAuthConfig(pool, "casdoor_admin_password", CASDOOR_ADMIN_PASSWORD, "setup-casdoor");
    await updateAuthConfig(pool, "casdoor_builtin_client_secret", CASDOOR_BUILTIN_CLIENT_SECRET, "setup-casdoor");
    console.log("✓ Configuration saved to database");

    await pool.end();

    console.log("");
    console.log("✓ Casdoor setup complete!");
    console.log("");
    console.log("You can now login with:");
    console.log(`  Username: ${CASDOOR_ADMIN_USERNAME}`);
    console.log(`  Email: ${CASDOOR_ADMIN_EMAIL}`);
    console.log(`  Password: ${CASDOOR_ADMIN_PASSWORD}`);
    console.log("");
    console.log("Configuration saved to database:");
    console.log(`  OIDC_CLIENT_ID: ${CASDOOR_CLIENT_ID}`);
    console.log(`  OIDC_CLIENT_SECRET: ${secret}`);
  } catch (error) {
    console.error("Error setting up Casdoor:", error);
    await pool.end();
    process.exit(1);
  }
}

main();

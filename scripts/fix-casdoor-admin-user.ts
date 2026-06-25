/**
 * Una-tantum fix script: corrects the Casdoor admin user's boolean flags
 * (emailVerified, isAdmin, isVerified) that were not set when the user was
 * originally created (before commit 3720c09 added these fields to setup-casdoor.ts).
 *
 * Also inserts the `enable_email_verification_check` config row (default: false)
 * into auth_configurations for existing databases.
 *
 * Run once: `pnpm run fix:casdoor-admin`
 */
import "dotenv/config";
import { Pool } from "pg";
import { loadAuthConfigFromDb, updateAuthConfig } from "../src/modules/auth/config-repo.js";

const BASE_DATABASE_URL =
  process.env.DATABASE_URL || "postgres://primebrick:primebrick_dev@127.0.0.1:5432/primebrick";

async function main(): Promise<void> {
  console.log("🔧 [FIX] Casdoor admin user una-tantum fix...");

  const pool = new Pool({ connectionString: BASE_DATABASE_URL });

  try {
    // 1. Load config from PG
    const cfg = await loadAuthConfigFromDb(pool);
    console.log(`  → Casdoor endpoint: ${cfg.casdoorEndpoint}`);
    console.log(`  → Organization: ${cfg.casdoorOrganization}`);

    if (!cfg.casdoorBuiltinClientId || !cfg.casdoorBuiltinClientSecret) {
      throw new Error("Casdoor builtin credentials not configured in auth_configurations table.");
    }

    // 2. Build API helper (same pattern as setup-casdoor.ts)
    const casdoorFetch = async (endpoint: string, options?: RequestInit) => {
      const url = new URL(`${cfg.casdoorEndpoint}/api${endpoint}`);
      url.searchParams.set("clientId", cfg.casdoorBuiltinClientId);
      url.searchParams.set("clientSecret", cfg.casdoorBuiltinClientSecret);
      const response = await fetch(url.toString(), {
        ...options,
        headers: { "Content-Type": "application/json", ...options?.headers },
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        (error as any).response = { status: response.status, data: await response.json() };
        throw error;
      }
      return response.json();
    };

    const orgName = cfg.casdoorOrganization;
    const userName = cfg.casdoorAdminUsername;

    // 3. Fetch existing admin user
    console.log(`\n📡 [API] Fetching user ${orgName}/${userName}...`);
    const userResp = await casdoorFetch(`/get-user?id=${orgName}/${userName}`);
    if (!userResp.data) {
      throw new Error(`User ${orgName}/${userName} not found in Casdoor.`);
    }
    const user = userResp.data;
    console.log(
      `  → Current state: emailVerified=${user.emailVerified}, isAdmin=${user.isAdmin}, isVerified=${user.isVerified}`,
    );

    // 4. Update user with correct flags
    console.log(`\n📡 [API] Updating user flags...`);
    const updateRes = await casdoorFetch(`/update-user?id=${orgName}/${userName}`, {
      method: "POST",
      body: JSON.stringify({
        id: user.id,
        owner: orgName,
        name: userName,
        displayName: user.displayName || "Primebrick Admin",
        email: user.email,
        isAdmin: true,
        isVerified: true,
        emailVerified: true,
        isForbidden: false,
      }),
    });

    if (updateRes.status === "error") {
      throw new Error(`Update failed: ${updateRes.msg}`);
    }
    console.log("  ↳ ✅ User updated successfully.");

    // 5. Verify
    console.log(`\n📡 [API] Verifying update...`);
    const verifyResp = await casdoorFetch(`/get-user?id=${orgName}/${userName}`);
    const verifyUser = verifyResp.data;
    console.log(
      `  → New state: emailVerified=${verifyUser.emailVerified}, isAdmin=${verifyUser.isAdmin}, isVerified=${verifyUser.isVerified}`,
    );

    if (verifyUser.emailVerified !== true || verifyUser.isAdmin !== true) {
      console.warn(
        "  ⚠️  WARNING: Verification shows flags not applied. Manual intervention may be required via Casdoor UI.",
      );
    }

    // 6. Insert enable_email_verification_check config (default: false)
    console.log(`\n💾 [DB] Inserting enable_email_verification_check=false config...`);
    await updateAuthConfig(pool, "enable_email_verification_check", "false", "fix-casdoor-admin-user");
    console.log("  ↳ ✅ Config inserted.");

    console.log("\n🏁 [COMPLETATO] Fix applicato con successo.");
  } catch (err: any) {
    console.error("\n💥 Errore fatale:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n💥 Errore fatale:", err.message);
  process.exit(1);
});

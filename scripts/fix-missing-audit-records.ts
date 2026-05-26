import "dotenv/config";
import { Pool } from "pg";

const BASE_DATABASE_URL = process.env.DATABASE_URL || "postgres://primebrick:primebrick_dev@127.0.0.1:5432/primebrick";

async function main(): Promise<void> {
  console.log("🔧 [FIX AUDIT] Adding missing audit records for existing organization and user...");

  const pool = new Pool({ connectionString: BASE_DATABASE_URL });

  try {
    // 1. Get the ACME organization record
    console.log("\n📋 Querying ACME organization...");
    const orgResult = await pool.query(
      "SELECT id, uuid, idp_code, display_name, website_url, idp_owner, idp_name, created_at, created_by FROM public.organizations WHERE idp_code = $1",
      ["admin/acme"]
    );

    if (orgResult.rows.length === 0) {
      console.log("  ↳ ⚠️  ACME organization not found. Skipping organization audit record.");
    } else {
      const org = orgResult.rows[0];
      console.log(`  ↳ ✅ Found organization: id=${org.id}, uuid=${org.uuid}, idp_code=${org.idp_code}`);

      // Check if audit record already exists
      const existingAudit = await pool.query(
        "SELECT id FROM public.organizations_audit WHERE entity_uuid = $1 AND action = 'INSERT'",
        [org.uuid]
      );

      if (existingAudit.rows.length > 0) {
        console.log("  ↳ ⚠️  Organization audit record already exists. Skipping.");
      } else {
        // Insert audit record for organization
        await pool.query(
          `INSERT INTO public.organizations_audit
           (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            org.id,
            org.uuid,
            "INSERT",
            org.created_at,
            org.created_by || " (backfilled)",
            1,
            JSON.stringify({
              idp_code: { old: null, new: org.idp_code },
              display_name: { old: null, new: org.display_name },
              website_url: { old: null, new: org.website_url },
              idp_owner: { old: null, new: org.idp_owner },
              idp_name: { old: null, new: org.idp_name },
            })
          ]
        );
        console.log("  ↳ ✅ Organization audit record created.");
      }
    }

    // 2. Get the admin user profile
    console.log("\n📋 Querying admin user profile...");
    const userResult = await pool.query(
      `SELECT id, uuid, idp_code, email, display_name, idp_org, idp_username, avatar_color, avatar_initials, is_admin, is_verified, email_verified, created_at, created_by 
       FROM public.user_profiles 
       WHERE idp_username = $1 OR email = $2`,
      ["admin", "admin@acme.local"]
    );

    if (userResult.rows.length === 0) {
      console.log("  ↳ ⚠️  Admin user profile not found. Skipping user audit record.");
    } else {
      const user = userResult.rows[0];
      console.log(`  ↳ ✅ Found user: id=${user.id}, uuid=${user.uuid}, email=${user.email}`);

      // Check if audit record already exists
      const existingAudit = await pool.query(
        "SELECT id FROM public.user_profiles_audit WHERE entity_uuid = $1 AND action = 'INSERT'",
        [user.uuid]
      );

      if (existingAudit.rows.length > 0) {
        console.log("  ↳ ⚠️  User audit record already exists. Skipping.");
      } else {
        // Insert audit record for user
        await pool.query(
          `INSERT INTO public.user_profiles_audit
           (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            user.id,
            user.uuid,
            "INSERT",
            user.created_at,
            user.created_by || " (backfilled)",
            1,
            JSON.stringify({
              idp_code: { old: null, new: user.idp_code },
              email: { old: null, new: user.email },
              display_name: { old: null, new: user.display_name },
              idp_org: { old: null, new: user.idp_org },
              idp_username: { old: null, new: user.idp_username },
              avatar_color: { old: null, new: user.avatar_color },
              avatar_initials: { old: null, new: user.avatar_initials },
              is_admin: { old: null, new: user.is_admin },
              is_verified: { old: null, new: user.is_verified },
              email_verified: { old: null, new: user.email_verified },
            })
          ]
        );
        console.log("  ↳ ✅ User audit record created.");
      }
    }

    console.log("\n🏁 [COMPLETATO] Missing audit records have been added.");
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err.message);
  process.exit(1);
});

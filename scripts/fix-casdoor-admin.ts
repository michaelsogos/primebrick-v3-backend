import "dotenv/config";
import axios from "axios";
import { Pool } from "pg";

// Helper function to convert string to snake_case lower case
function toSnakeCaseLower(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "primebrick-api";
const CASDOOR_ADMIN_USERNAME = process.env.CASDOOR_ADMIN_USERNAME || "admin";
const CASDOOR_ADMIN_EMAIL = process.env.CASDOOR_ADMIN_EMAIL || "admin@acme.local";
const CASDOOR_ADMIN_PASSWORD = process.env.CASDOOR_ADMIN_PASSWORD || "admin";
const CASDOOR_ORGANIZATION = process.env.CASDOOR_ORGANIZATION || "ACME";

// Convert names to snake_case lower case (Casdoor uses NAME as ID)
const ORG_NAME = toSnakeCaseLower(CASDOOR_ORGANIZATION);
const USER_NAME = toSnakeCaseLower(CASDOOR_ADMIN_USERNAME);

const BASE_DATABASE_URL = process.env.DATABASE_URL || "postgres://primebrick:primebrick_dev@127.0.0.1:5432/primebrick";
const CASDOOR_DATABASE_URL = BASE_DATABASE_URL.endsWith("/primebrick") 
  ? BASE_DATABASE_URL.replace(/\/primebrick$/, "/casdoor")
  : BASE_DATABASE_URL.includes("dbname=primebrick")
    ? BASE_DATABASE_URL.replace("dbname=primebrick", "dbname=casdoor")
    : BASE_DATABASE_URL;

async function main(): Promise<void> {
  console.log("🔧 [FIX ADMIN] Avvio fix forzato utente admin in Casdoor...");

  // 1. Get master credentials from Casdoor DB
  console.log("\n🔑 [DB CASDOOR] Recupero credenziali master...");
  const casdoorPool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  let liveClientId = "";
  let liveClientSecret = "";

  try {
    const masterRes = await casdoorPool.query(
      "SELECT client_id, client_secret FROM application WHERE name = 'app-built-in' AND owner = 'admin'"
    );
    if (masterRes.rows.length === 0) throw new Error("Nessun record app-built-in nel DB Casdoor.");
    liveClientId = masterRes.rows[0].client_id;
    liveClientSecret = masterRes.rows[0].client_secret;
    console.log("  ↳ ✅ Credenziali master recuperate.");
  } catch (err: any) {
    console.error("❌ [DB CRITICAL ERROR]:", err.message);
    process.exit(1);
  } finally {
    await casdoorPool.end();
  }

  // 2. Configure HTTP client with master credentials
  const http = axios.create({
    baseURL: `${CASDOOR_ENDPOINT}/api`,
    params: { clientId: liveClientId, clientSecret: liveClientSecret },
  });

  console.log(`  ↳ 📡 Casdoor endpoint: ${CASDOOR_ENDPOINT}/api`);
  console.log(`  ↳ 🔑 Client ID: ${liveClientId}`);
  console.log(`  ↳ 🏢 Org: ${ORG_NAME}, User: ${USER_NAME}`);

  // 3. Check if admin user exists
  console.log("\n🔍 [API] Verifica esistenza utente admin...");
  let casdoorUserId: string | null = null;
  let userExists = false;

  // Try multiple ID formats
  const userIdFormats = [
    `${ORG_NAME}/${USER_NAME}`,
    `admin/${USER_NAME}`,
    USER_NAME,
  ];

  for (const userId of userIdFormats) {
    try {
      const getUrl = `/get-user?id=${userId}`;
      console.log(`  ↳ 📡 Tentativo GET: ${CASDOOR_ENDPOINT}/api${getUrl}`);
      const getRes = await http.get(getUrl);
      console.log(`  ↳ 📥 Response status: ${getRes.status}`);
      console.log(`  ↳ 📦 Response data:`, JSON.stringify(getRes.data, null, 2));

      // Casdoor returns user data in data.data field
      const userData = getRes.data?.data;
      if (userData && userData.id) {
        casdoorUserId = userData.id;
        userExists = true;
        console.log(`  ↳ ✅ Utente admin trovato con ID: ${userId}`);
        console.log(`  ↳ 🆔 Casdoor UUID: ${casdoorUserId}`);
        console.log(`  ↳ 📊 Stato attuale: isAdmin=${userData.isAdmin}, isVerified=${userData.isVerified}, emailVerified=${userData.emailVerified}`);
        break;
      } else {
        console.log(`  ↳ ⚠️  Utente non trovato con ID: ${userId} (response vuota)`);
      }
    } catch (err: any) {
      console.log(`  ↳ ⚠️  Errore con ID ${userId}: status=${err.response?.status}, message=${err.message}`);
      if (err.response?.data) {
        console.log(`  ↳ 📦 Error response:`, JSON.stringify(err.response.data, null, 2));
      }
    }
  }

  if (!userExists) {
    console.log("  ↳ ❌ Utente admin non trovato con nessun formato ID provato.");
    console.log("  ↳ 🔍 Tentativo di listare tutti gli utenti nell'organizzazione...");
    try {
      const usersUrl = `/get-users?owner=${ORG_NAME}`;
      console.log(`  ↳ 📡 GET: ${CASDOOR_ENDPOINT}/api${usersUrl}`);
      const usersRes = await http.get(usersUrl);
      console.log(`  ↳ 📥 Response status: ${usersRes.status}`);

      if (usersRes.data && usersRes.data.data && Array.isArray(usersRes.data.data)) {
        const users = usersRes.data.data;
        console.log(`  ↳ 📦 Trovati ${users.length} utenti nell'organizzazione.`);

        // Find admin user by name
        const adminUser = users.find((u: any) => u.name === USER_NAME);
        if (adminUser) {
          casdoorUserId = adminUser.id;
          userExists = true;
          console.log(`  ↳ ✅ Utente admin trovato via list: ${adminUser.name}`);
          console.log(`  ↳ 🆔 Casdoor UUID: ${casdoorUserId}`);
          console.log(`  ↳ 📊 Stato attuale: isAdmin=${adminUser.isAdmin}, isVerified=${adminUser.isVerified}, emailVerified=${adminUser.emailVerified}`);
        } else {
          console.log("  ↳ ❌ Nessun utente admin trovato nella lista.");
        }
      } else {
        console.log("  ↳ 📦 Utenti trovati:", JSON.stringify(usersRes.data, null, 2));
      }
    } catch (err: any) {
      console.error("  ↳ ❌ Errore list utenti:", err.message);
      if (err.response?.data) {
        console.log(`  ↳ 📦 Error response:`, JSON.stringify(err.response.data, null, 2));
      }
    }
  }

  // 4. Update or create user
  if (userExists && casdoorUserId) {
    console.log("\n📝 [API] Update forzato utente admin (solo isAdmin, isVerified, emailVerified)...");
    try {
      const updateUrl = `/update-user?id=${ORG_NAME}/${USER_NAME}`;
      console.log(`  ↳ 📡 POST: ${CASDOOR_ENDPOINT}/api${updateUrl}`);
      const updatePayload = {
        id: casdoorUserId,
        owner: ORG_NAME,
        name: USER_NAME,
        displayName: "Primebrick Admin",
        isAdmin: true,
        isVerified: true,
        emailVerified: true,
      };
      console.log(`  ↳ 📦 Payload:`, JSON.stringify(updatePayload, null, 2));
      const updateRes = await http.post(updateUrl, updatePayload);
      console.log(`  ↳ 📥 Response status: ${updateRes.status}`);
      console.log(`  ↳ 📦 Response data:`, JSON.stringify(updateRes.data, null, 2));

      // Verify update by fetching user again via API
      console.log("  ↳ 🔍 Verifica post-update via API...");
      const verifyRes = await http.get(`/get-user?id=${ORG_NAME}/${USER_NAME}`);
      const verifyData = verifyRes.data?.data;
      console.log(`  ↳ 📊 Stato API dopo update: isAdmin=${verifyData?.isAdmin}, isVerified=${verifyData?.isVerified}, emailVerified=${verifyData?.emailVerified}`);

      // Verify update by querying Casdoor DB directly
      console.log("  ↳ 🔍 Verifica post-update via DB Casdoor diretto...");
      const casdoorVerifyPool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
      try {
        // Discover schema
        const schemaRes = await casdoorVerifyPool.query(
          "SELECT table_schema FROM information_schema.tables WHERE table_name = 'user'"
        );
        console.log("  ↳ 📋 Schema tabella user:", schemaRes.rows.map((r: any) => r.table_schema).join(", "));

        // Get schema name (first one)
        const schema = schemaRes.rows[0]?.table_schema || 'public';

        // Query with correct schema
        const dbVerifyRes = await casdoorVerifyPool.query(
          `SELECT is_admin, is_verified, email_verified FROM ${schema}.user WHERE name = $1 AND owner = $2 LIMIT 1`,
          [USER_NAME, ORG_NAME]
        );
        if (dbVerifyRes.rows.length > 0) {
          const dbRow = dbVerifyRes.rows[0];
          console.log(`  ↳ 📊 Stato DB Casdoor dopo update: isAdmin=${dbRow.is_admin}, isVerified=${dbRow.is_verified}, emailVerified=${dbRow.email_verified}`);

          // If isVerified is still false, force update directly in DB
          if (dbRow.is_verified === false) {
            console.log("  ↳ ⚠️  isVerified ancora false, forzo update diretto nel DB Casdoor...");
            await casdoorVerifyPool.query(
              `UPDATE ${schema}.user SET is_verified = true WHERE name = $1 AND owner = $2`,
              [USER_NAME, ORG_NAME]
            );
            console.log("  ↳ ✅ Update diretto DB Casdoor eseguito");

            // Verify again
            const dbVerifyRes2 = await casdoorVerifyPool.query(
              `SELECT is_admin, is_verified, email_verified FROM ${schema}.user WHERE name = $1 AND owner = $2 LIMIT 1`,
              [USER_NAME, ORG_NAME]
            );
            if (dbVerifyRes2.rows.length > 0) {
              const dbRow2 = dbVerifyRes2.rows[0];
              console.log(`  ↳ 📊 Stato DB Casdoor dopo update forzato: isAdmin=${dbRow2.is_admin}, isVerified=${dbRow2.is_verified}, emailVerified=${dbRow2.email_verified}`);
            }
          }
        } else {
          console.log("  ↳ ⚠️  Nessun record trovato nel DB Casdoor");
        }
      } catch (dbErr: any) {
        console.error("  ↳ ❌ Errore verifica DB Casdoor:", dbErr.message);
      } finally {
        await casdoorVerifyPool.end();
      }

      if (verifyData?.isAdmin === true && verifyData?.emailVerified === true) {
        console.log("  ↳ ✅ Utente admin aggiornato con successo e verificato.");
        if (verifyData?.isVerified !== true) {
          console.log("  ↳ ⚠️  Nota: isVerified non è stato aggiornato (potrebbe non essere modificabile via API)");
        }
      } else {
        console.error("  ↳ ❌ Update non riuscito: valori non corretti dopo update");
        process.exit(1);
      }
    } catch (err: any) {
      console.error("  ↳ ❌ Errore update utente:", err.message);
      console.error("  ↳ 📦 Stack trace:", err.stack);
      if (err.response) {
        console.error("  ↳ 📥 Response status:", err.response.status);
        console.error("  ↳ 📦 Response data:", JSON.stringify(err.response.data, null, 2));
      }
      process.exit(1);
    }
  } else {
    console.log("\n📝 [API] Creazione utente admin da zero...");
    // Generate static initials and SVG for admin user
    const initials = "PA";
    const defaultColor = "#4f46e5";
    const { generateHexagonAvatarSvg } = await import("../src/modules/auth/avatar-svg-generator.js");
    const svgDataUri = generateHexagonAvatarSvg(initials, defaultColor);

    const createPayload = {
      owner: ORG_NAME,
      name: USER_NAME,
      displayName: "Primebrick Admin",
      email: CASDOOR_ADMIN_EMAIL,
      password: CASDOOR_ADMIN_PASSWORD,
      isAdmin: true,
      isGlobalAdmin: false,
      signupApplication: CASDOOR_CLIENT_ID,
      isVerified: true,
      emailVerified: true,
      customFields: {
        app_avatar_color: defaultColor,
        app_avatar_shape: "hexagon",
        app_avatar_letters: initials,
      },
      avatar: svgDataUri,
    };

    try {
      const createUrl = `/add-user?id=${ORG_NAME}/${USER_NAME}`;
      console.log(`  ↳ 📡 POST: ${CASDOOR_ENDPOINT}/api${createUrl}`);
      console.log(`  ↳ 📦 Payload (senza password):`, JSON.stringify({ ...createPayload, password: "***" }, null, 2));
      const createRes = await http.post(createUrl, createPayload);
      console.log(`  ↳ 📥 Response status: ${createRes.status}`);
      console.log(`  ↳ 📦 Response data:`, JSON.stringify(createRes.data, null, 2));

      casdoorUserId = createRes.data?.data?.id || createRes.data?.id;
      if (!casdoorUserId) {
        console.error("  ↳ ❌ Creazione utente: nessun ID ritornato da Casdoor");
        process.exit(1);
      }

      // Verify creation by fetching user
      console.log("  ↳ 🔍 Verifica post-creazione...");
      const verifyRes = await http.get(`/get-user?id=${ORG_NAME}/${USER_NAME}`);
      console.log(`  ↳ 🆔 Casdoor UUID: ${verifyRes.data.id}`);
      console.log(`  ↳ 📊 Stato dopo creazione: isAdmin=${verifyRes.data.isAdmin}, isVerified=${verifyRes.data.isVerified}, emailVerified=${verifyRes.data.emailVerified}`);

      if (verifyRes.data.isAdmin === true && verifyRes.data.isVerified === true && verifyRes.data.emailVerified === true) {
        console.log("  ↳ ✅ Utente admin creato con successo e verificato.");
      } else {
        console.error("  ↳ ❌ Creazione non riuscita: valori non corretti dopo creazione");
        process.exit(1);
      }
    } catch (err: any) {
      console.error("  ↳ ❌ Errore creazione utente:", err.message);
      console.error("  ↳ 📦 Stack trace:", err.stack);
      if (err.response) {
        console.error("  ↳ 📥 Response status:", err.response.status);
        console.error("  ↳ 📦 Response data:", JSON.stringify(err.response.data, null, 2));
      }
      process.exit(1);
    }
  }

  // 5. Update local Primebrick DB with last_synced_at
  if (casdoorUserId) {
    console.log("\n💾 [DB PRIMEBRICK] Aggiornamento last_synced_at...");
    const pbPool = new Pool({ connectionString: BASE_DATABASE_URL });
    try {
      await pbPool.query(
        `UPDATE public.user_profiles
         SET last_synced_at = NOW(),
             updated_at = NOW(),
             version = version + 1
         WHERE idp_code = $1`,
        [casdoorUserId]
      );
      console.log("  ↳ ✅ last_synced_at aggiornato nel DB Primebrick.");
    } catch (err: any) {
      console.error("  ↳ ❌ Errore aggiornamento DB Primebrick:", err.message);
    } finally {
      await pbPool.end();
    }
  }

  console.log("\n🏁 [COMPLETATO] Fix admin completato.");
}

main().catch((err) => {
  console.error("\n💥 Errore fatale:", err.message);
  process.exit(1);
});

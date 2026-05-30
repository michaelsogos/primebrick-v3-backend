import "dotenv/config";
import { Pool } from "pg";
import crypto from "crypto";

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
const ROLE_ADMINISTRATORS = "administrators";
const ROLE_COLLABORATOR = "collaborator";
const ROLE_GUEST = "guest";
const USER_NAME = toSnakeCaseLower(CASDOOR_ADMIN_USERNAME);

const BASE_DATABASE_URL = process.env.DATABASE_URL || "postgres://primebrick:primebrick_dev@127.0.0.1:5432/primebrick";
const CASDOOR_DATABASE_URL = BASE_DATABASE_URL.endsWith("/primebrick") 
  ? BASE_DATABASE_URL.replace(/\/primebrick$/, "/casdoor")
  : BASE_DATABASE_URL.includes("dbname=primebrick")
    ? BASE_DATABASE_URL.replace("dbname=primebrick", "dbname=casdoor")
    : BASE_DATABASE_URL;

async function main(): Promise<void> {
  console.log("� [INIT] Avvio pipeline di configurazione master condizionale...");

  // 1. APPLICAZIONE FIX COMPLETO VIA SQL SUL DB CASDOOR
  console.log(`\n🛠️  [DB CASDOOR] Allineamento tabelle core nativizzate...`);
  const casdoorPool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  
  let liveClientId = "";
  let liveClientSecret = "";
  let pbClientId = "pb-client-id-secure"; 
  let pbClientSecret = "pb-secret-secure-2026-key";

  try {
    // Aggiorna grant types sull'app integrata di Casdoor
    await casdoorPool.query(
      "UPDATE application SET grant_types = '[\"password\", \"authorization_code\", \"client_credentials\"]' WHERE name = 'app-built-in'"
    );
    
    // Recupera credenziali master per le chiamate HTTP API
    const masterRes = await casdoorPool.query(
      "SELECT client_id, client_secret FROM application WHERE name = 'app-built-in' AND owner = 'admin'"
    );
    if (masterRes.rows.length === 0) throw new Error("Nessun record app-built-in nel DB Casdoor.");
    liveClientId = masterRes.rows[0].client_id;
    liveClientSecret = masterRes.rows[0].client_secret;

    // Forza la presenza e i token dell'app primebrick-api via SQL evitando i bug delle API
    const pbAppCheck = await casdoorPool.query(
      "SELECT client_id, client_secret FROM application WHERE name = $1 AND owner = 'admin'",
      [CASDOOR_CLIENT_ID]
    );

    if (pbAppCheck.rows.length > 0) {
      // Mantieni il client_id esistente, se è vuoto usa il nome app
      pbClientId = pbAppCheck.rows[0].client_id || "primebrick-api";
      // Se il secret a DB è vuoto o uguale alla stringa fissa vecchia, ne rigenera uno random pulito
      pbClientSecret = (pbAppCheck.rows[0].client_secret && pbAppCheck.rows[0].client_secret !== "pb-secret-secure-2026-key")
        ? pbAppCheck.rows[0].client_secret
        : crypto.randomBytes(24).toString("hex");
      
      await casdoorPool.query(
        `UPDATE application
         SET grant_types = '["password", "authorization_code", "client_credentials"]',
             client_id = $1, client_secret = $2, expire_in_hours = 1, refresh_expire_in_hours = 24, organization = $4
         WHERE name = $3 AND owner = 'admin'`,
        [pbClientId, pbClientSecret, CASDOOR_CLIENT_ID, ORG_NAME]
      );
      console.log("  ↳ ✅ Applicazione primebrick-api aggiornata (Token: 1h, Refresh: 24h).");
    } else {
      // Se non esiste la inseriamo pulita direttamente nelle tabelle
      // Nota: lo script assume che l'organizzazione ACME venga creata subito dopo via API HTTP
      await casdoorPool.query(
        `INSERT INTO application (owner, name, created_time, display_name, logo, homepage_url, description, organization, cert, enable_password, enable_sign_up, client_id, client_secret, redirect_uris, token_format, expire_in_hours, refresh_expire_in_hours, grant_types)
         VALUES ('admin', $1, NOW()::text, 'Primebrick API', '', '', '', $2, '', true, false, $3, $4, '["http://localhost:3000/callback"]', 'JWT', 1, 24, '["password", "authorization_code", "client_credentials"]')`,
        [CASDOOR_CLIENT_ID, ORG_NAME, pbClientId, pbClientSecret]
      );
      console.log("  ↳ ✅ Applicazione primebrick-api creata da zero via SQL.");
    }
  } catch (err: any) {
    console.error("❌ [DB CRITICAL ERROR]:", err.message);
    process.exit(1);
  } finally {
    await casdoorPool.end();
  }

  // 2. CONFIGURAZIONE CLIENT HTTP API CON CHIAVI MASTER CERTE
  const casdoorFetch = async (endpoint: string, options?: RequestInit) => {
    const url = new URL(`${CASDOOR_ENDPOINT}/api${endpoint}`);
    url.searchParams.set('clientId', liveClientId);
    url.searchParams.set('clientSecret', liveClientSecret);
    
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      (error as any).response = { status: response.status, data: await response.json() };
      throw error;
    }
    
    return response.json();
  };

  const handleResponse = (res: any, context: string) => {
    if (res.status === "error") {
      if (res.msg.includes("already exists") || res.msg.includes("duplicate")) {
        console.log(`  ↳ ⚠️  [${context}] Entità già presente. Continua.`);
        return;
      }
      throw new Error(`[Casdoor API Error - ${context}] ${res.msg}`);
    }
    console.log(`  ↳ ✅ [${context}] Eseguito con successo.`);
  };

  // 3. CREAZIONE ORGANIZZAZIONE
  console.log("\n📡 [API] Sincronizzazione Organizzazione...");
  const resOrg = await casdoorFetch(`/add-organization?id=admin/${ORG_NAME}`, {
    method: 'POST',
    body: JSON.stringify({
      owner: "admin", name: ORG_NAME, displayName: CASDOOR_ORGANIZATION, websiteUrl: "https://acme.io", passwordType: "plain"
    }),
  });
  handleResponse(resOrg, "Crea Organizzazione");

  // 3.5. CREAZIONE ORGANIZZAZIONE IN PRIMEBRICK DB
  console.log("\n💾 [DB PRIMEBRICK] Creazione organization record...");
  const orgPool = new Pool({ connectionString: BASE_DATABASE_URL });
  try {
    const orgUuid = crypto.randomUUID();
    const now = new Date();
    
    await orgPool.query(
      `INSERT INTO public.organizations
       (uuid, idp_code, display_name, website_url, idp_owner, idp_name, last_synced_at, created_at, created_by, updated_at, updated_by, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
       ON CONFLICT (idp_code) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         website_url = EXCLUDED.website_url,
         idp_owner = EXCLUDED.idp_owner,
         idp_name = EXCLUDED.idp_name,
         last_synced_at = EXCLUDED.last_synced_at,
         updated_at = EXCLUDED.updated_at,
         updated_by = EXCLUDED.updated_by,
         version = organizations.version + 1`,
      [orgUuid, `admin/${ORG_NAME}`, CASDOOR_ORGANIZATION, "https://acme.io", "admin", ORG_NAME, now, now, "setup-casdoor", now, "setup-casdoor"]
    );
    console.log("  ↳ ✅ Organization record created in Primebrick DB.");

    // Query the organization ID for audit record
    const orgResult = await orgPool.query(
      "SELECT id FROM public.organizations WHERE idp_code = $1",
      [`admin/${ORG_NAME}`]
    );
    const orgId = orgResult.rows[0].id;

    // Insert audit record for organization creation
    await orgPool.query(
      `INSERT INTO public.organizations_audit
       (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        orgId,
        orgUuid,
        "INSERT",
        now,
        "setup-casdoor",
        1,
        JSON.stringify({
          idp_code: { old: null, new: `admin/${ORG_NAME}` },
          display_name: { old: null, new: CASDOOR_ORGANIZATION },
          website_url: { old: null, new: "https://acme.io" },
          idp_owner: { old: null, new: "admin" },
          idp_name: { old: null, new: ORG_NAME },
        })
      ]
    );
    console.log("  ↳ ✅ Organization audit record created.");
  } catch (orgErr: any) {
    console.error("  ↳ ⚠️  Errore creazione organization:", orgErr.message);
  } finally {
    await orgPool.end();
  }

  // 4. CREAZIONE RUOLI (Administrators, Collaborator, Guest)
  console.log("\n📡 [API] Sincronizzazione Ruoli...");
  const resRoleAdmin = await casdoorFetch(`/add-role?id=${ORG_NAME}/${ROLE_ADMINISTRATORS}`, {
    method: 'POST',
    body: JSON.stringify({
      owner: ORG_NAME, name: ROLE_ADMINISTRATORS, displayName: "Administrators", description: "Administrators role", isEnabled: true
    }),
  });
  handleResponse(resRoleAdmin, "Crea Ruolo Administrators");

  const resRoleCollaborator = await casdoorFetch(`/add-role?id=${ORG_NAME}/${ROLE_COLLABORATOR}`, {
    method: 'POST',
    body: JSON.stringify({
      owner: ORG_NAME, name: ROLE_COLLABORATOR, displayName: "Collaborator", description: "Collaborator role", isEnabled: true
    }),
  });
  handleResponse(resRoleCollaborator, "Crea Ruolo Collaborator");

  const resRoleGuest = await casdoorFetch(`/add-role?id=${ORG_NAME}/${ROLE_GUEST}`, {
    method: 'POST',
    body: JSON.stringify({
      owner: ORG_NAME, name: ROLE_GUEST, displayName: "Guest", description: "Guest role", isEnabled: true
    }),
  });
  handleResponse(resRoleGuest, "Crea Ruolo Guest");

  // Force update administrators role to isEnabled=true via SQL (in case it already existed)
  console.log("\n🛠️  [DB CASDOOR] Aggiornamento ruoli esistenti...");
  const roleUpdatePool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  try {
    await roleUpdatePool.query("UPDATE role SET is_enabled = true WHERE name = $1 AND owner = $2", [ROLE_ADMINISTRATORS, ORG_NAME]);
    console.log("  ↳ ✅ Ruolo Administrators aggiornato a isEnabled=true.");
  } catch (err: any) {
    console.log("  ↳ ⚠️  Impossibile aggiornare ruolo administrators:", err.message);
  } finally {
    await roleUpdatePool.end();
  }

  // 5. CREAZIONE UTENTE ADMIN
  console.log("\n📡 [API] Sincronizzazione Utente...");

  // Generate static initials and SVG for admin user
  const initials = "PA"; // Primebrick Admin (static)
  const defaultColor = "#4f46e5";
  const { generateHexagonAvatarSvg } = await import("../src/modules/auth/avatar-svg-generator.js");
  const svgDataUri = generateHexagonAvatarSvg(initials, defaultColor);

  const resUser = await casdoorFetch(`/add-user?id=${ORG_NAME}/${USER_NAME}`, {
    method: 'POST',
    body: JSON.stringify({
      owner: ORG_NAME, name: USER_NAME, displayName: "Primebrick Admin",
      email: CASDOOR_ADMIN_EMAIL, password: CASDOOR_ADMIN_PASSWORD, isAdmin: true, isGlobalAdmin: false, signupApplication: CASDOOR_CLIENT_ID,
      isVerified: true,
      emailVerified: true,
      customFields: {
        app_avatar_color: defaultColor,
        app_avatar_shape: "hexagon",
        app_avatar_letters: initials,
      },
      avatar: svgDataUri,
    }),
  });
  handleResponse(resUser, "Crea Utente Admin");

  // Extract UUID, org, and username from Casdoor response
  const casdoorUser = resUser?.data || resUser;
  if (!casdoorUser || !casdoorUser.id) {
    throw new Error("Casdoor user creation did not return a UUID");
  }
  const casdoorUserId = casdoorUser.id;
  const casdoorOrg = casdoorUser.owner || ORG_NAME;
  const casdoorUsername = casdoorUser.name || USER_NAME;
  console.log(`  ↳ ✅ Casdoor user UUID: ${casdoorUserId}, org: ${casdoorOrg}, username: ${casdoorUsername}`);

  // 6. ASSOCIAZIONE UTENTE AL RUOLO (Via SQL per evitare sovrascritture distruttive nel DB Casdoor)
  console.log("\n🔗 [DB CASDOOR] Associazione Utente -> Ruolo Administrators...");
  const linkPool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  try {
    const roleKey = `${ORG_NAME}/${ROLE_ADMINISTRATORS}`;
    const userKey = `${ORG_NAME}/${USER_NAME}`;

    // Verifichiamo se il link esiste già modificando la colonna users (formato array stringhe o testo nel DB)
    const roleRes = await linkPool.query("SELECT users FROM role WHERE name=$1 AND owner=$2", [ROLE_ADMINISTRATORS, ORG_NAME]);
    if (roleRes.rows.length > 0) {
      let currentUsers: string[] = [];
      try {
        const usersValue = roleRes.rows[0].users;
        if (usersValue) {
          const parsed = typeof usersValue === 'string' ? JSON.parse(usersValue) : usersValue;
          if (Array.isArray(parsed)) {
            currentUsers = parsed;
          }
        }
      } catch { currentUsers = []; }

      if (!currentUsers.includes(userKey)) {
        currentUsers.push(userKey);
        await linkPool.query("UPDATE role SET users = $1 WHERE name=$2 AND owner=$3", [JSON.stringify(currentUsers), ROLE_ADMINISTRATORS, ORG_NAME]);
      }
    }
    console.log("  ↳ ✅ Associazione completata in sicurezza.");
  } finally {
    await linkPool.end();
  }

  // 7. SCRITTURA CONFIGURAZIONI VIVE SUL DB CORE APP (PRIMEBRICK)
  console.log("\n💾 [DB WRITE] Scrittura record definitivi nel DB Core...");
  const pbPool = new Pool({ connectionString: BASE_DATABASE_URL });
  try {
    // Import dinamico all'interno per evitare problemi di caricamento moduli prima delle env
    const { updateAuthConfig } = await import("../src/modules/auth/config-repo.js");
    
    await updateAuthConfig(pbPool, "oidc_client_id", pbClientId, "setup-casdoor");
    await updateAuthConfig(pbPool, "oidc_client_secret", pbClientSecret, "setup-casdoor");
    await updateAuthConfig(pbPool, "casdoor_admin_password", CASDOOR_ADMIN_PASSWORD, "setup-casdoor");
    await updateAuthConfig(pbPool, "casdoor_builtin_client_id", liveClientId, "setup-casdoor");
    await updateAuthConfig(pbPool, "casdoor_builtin_client_secret", liveClientSecret, "setup-casdoor");
    await updateAuthConfig(pbPool, "casdoor_organization", ORG_NAME, "setup-casdoor");
    console.log("  ↳ ✅ Chiavi consolidate sul database Primebrick.");

    // Create user profile in Primebrick DB
    const newUuid = crypto.randomUUID();
    const now = new Date();
    await pbPool.query(
      `INSERT INTO public.user_profiles
       (uuid, idp_code, email, display_name, idp_org, idp_username, avatar_color, avatar_initials, is_active, is_admin, is_verified, email_verified, issuer, roles, last_synced_at, created_at, created_by, updated_at, updated_by, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, true, true, $9, $10, $11, $12, $13, $14, 1)`,
      [newUuid, casdoorUserId, CASDOOR_ADMIN_EMAIL, "Primebrick Admin", casdoorOrg, casdoorUsername, defaultColor, initials,
       CASDOOR_ENDPOINT, JSON.stringify([ROLE_ADMINISTRATORS]), now, now, newUuid, now, newUuid]
    );
    console.log("  ↳ ✅ User profile created in Primebrick DB.");

    // Query the user ID for audit record
    const userResult = await pbPool.query(
      "SELECT id FROM public.user_profiles WHERE idp_code = $1",
      [casdoorUserId]
    );
    const userId = userResult.rows[0].id;

    // Insert audit record for user creation
    await pbPool.query(
      `INSERT INTO public.user_profiles_audit
       (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        newUuid,
        "INSERT",
        now,
        "setup-casdoor",
        1,
        JSON.stringify({
          idp_code: { old: null, new: casdoorUserId },
          email: { old: null, new: CASDOOR_ADMIN_EMAIL },
          display_name: { old: null, new: "Primebrick Admin" },
          idp_org: { old: null, new: casdoorOrg },
          idp_username: { old: null, new: casdoorUsername },
          avatar_color: { old: null, new: defaultColor },
          avatar_initials: { old: null, new: initials },
          is_admin: { old: null, new: true },
          is_verified: { old: null, new: true },
          email_verified: { old: null, new: true },
        })
      ]
    );
    console.log("  ↳ ✅ User profile audit record created.");
  } catch (dbErr: any) {
    console.error("❌ Errore salvataggio DB Core:", dbErr.message);
  } finally {
    await pbPool.end();
  }

  console.log("\n🏁 [COMPLETATO] Il sistema è allineato, sicuro e i token sono configurati a 1h e 24h.");
}

main().catch((err) => {
  console.error("\n💥 Errore fatale pipeline:", err.message);
  process.exit(1);
});

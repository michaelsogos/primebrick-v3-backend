import "dotenv/config";
import axios from "axios";
import { Pool } from "pg";
import { updateAuthConfig } from "../src/modules/auth/config-repo";

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "primebrick-api";
const CASDOOR_ADMIN_USERNAME = process.env.CASDOOR_ADMIN_USERNAME || "admin";
const CASDOOR_ADMIN_EMAIL = process.env.CASDOOR_ADMIN_EMAIL || "admin@acme.local";
const CASDOOR_ADMIN_PASSWORD = process.env.CASDOOR_ADMIN_PASSWORD || "admin";
const CASDOOR_ORGANIZATION = process.env.CASDOOR_ORGANIZATION || "ACME";

// Configura esplicitamente la stringa di connessione per puntare al database "casdoor"
// Sostituisce la parte finale del percorso (/primebrick) con /casdoor
const BASE_DATABASE_URL = process.env.DATABASE_URL || "postgres://primebrick:primebrick_dev@127.0.0.1:5432/primebrick";
const CASDOOR_DATABASE_URL = BASE_DATABASE_URL.endsWith("/primebrick") 
  ? BASE_DATABASE_URL.replace(/\/primebrick$/, "/casdoor")
  : BASE_DATABASE_URL.includes("dbname=primebrick")
    ? BASE_DATABASE_URL.replace("dbname=primebrick", "dbname=casdoor")
    : BASE_DATABASE_URL; // Fallback se è già configurata a dovere

async function enableGrantTypes(): Promise<void> {
  console.log(`🛠️  [DB CASDOOR] Abilitazione OAuth grant types su app-built-in... URL: ${CASDOOR_DATABASE_URL}`);
  const pool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  try {
    await pool.query(
      "UPDATE application SET grant_types = '[\"password\", \"authorization_code\", \"client_credentials\"]' WHERE name = 'app-built-in'"
    );
    console.log("  ↳ ✅ Grant types aggiornati sul database nativo di Casdoor.");
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  console.log("🚀 [DEBUG FLOW] Avvio setup con puntamento rigido al database di Casdoor...\n");

  // Aggiorna il DB di Casdoor
  await enableGrantTypes();

  // 1. ESTRAZIONE DELLE CHIAVI VIVE DAL DB CASDOOR
  const casdoorPool = new Pool({ connectionString: CASDOOR_DATABASE_URL });
  let liveClientId = "";
  let liveClientSecret = "";
  
  try {
    console.log(`📡 [DB READ] Estrazione credenziali master... URL: ${CASDOOR_DATABASE_URL}`);
    const result = await casdoorPool.query(
      "SELECT client_id, client_secret, name, owner FROM application WHERE name = 'app-built-in' AND owner = 'admin'"
    );
    
    console.log("📦 [DB RAW RESULT] Righe restituite da Postgres (CASDOOR):", JSON.stringify(result.rows, null, 2));

    if (result.rows.length === 0) {
      throw new Error("Nessun record trovato nella tabella application del database casdoor.");
    }
    
    liveClientId = result.rows[0].client_id;
    liveClientSecret = result.rows[0].client_secret;
    
    console.log(`🔍 [CREDENTIALS PARSED] Verificate ed estratte dal DB corretto:`);
    console.log(`   -> client_id:     "${liveClientId}"`);
    console.log(`   -> client_secret: "${liveClientSecret}"`);
  } catch (dbError: any) {
    console.error("❌ [DB ERROR] Impossibile leggere dal database casdoor:", dbError.message);
    process.exit(1);
  } finally {
    await casdoorPool.end();
  }

  // 2. CREAZIONE DEL CLIENT HTTP CON LE CHIAVI REALI
  console.log(`\n🔗 [HTTP INIT] Configurazione client Axios verso Casdoor...`);
  const http = axios.create({
    baseURL: `${CASDOOR_ENDPOINT}/api`,
    params: {
      clientId: liveClientId,
      clientSecret: liveClientSecret,
    },
  });

  const handleResponse = (res: any, context: string) => {
    console.log(`📥 [RESPONSE - ${context}] HTTP Status:`, res.status);
    if (res.data && res.data.status === "error") {
      if (res.data.msg.includes("already exists") || res.data.msg.includes("duplicate")) {
        console.log(`   ↳ ⚠️  [${context}] Entità già presente. Procedo.`);
        return;
      }
      throw new Error(`[Casdoor Core Error] ${res.data.msg}`);
    }
    console.log(`   ↳ ✅ [${context}] Successo.`);
  };

  // 3. SINC VIA API
  console.log("\n--------------------------------------------------");
  console.log("⚙️  [API CALL] Sincronizzazione struttura applicazione master...");
  const appBuiltInRes = await http.get("/get-application?id=admin/app-built-in");
  if (appBuiltInRes.data?.data) {
    const appBuiltIn = appBuiltInRes.data.data;
    appBuiltIn.grantTypes = ["password", "authorization_code", "client_credentials"];
    const resUpdate = await http.post("/update-application?id=admin/app-built-in", appBuiltIn);
    handleResponse(resUpdate, "Update Built-In App");
  }

  // 4. CREAZIONE ORGANIZZAZIONE ACME
  console.log("\n--------------------------------------------------");
  const orgUrl = `/add-organization?id=admin/${CASDOOR_ORGANIZATION}`;
  const orgPayload = {
    owner: "admin",
    name: CASDOOR_ORGANIZATION,
    displayName: CASDOOR_ORGANIZATION,
    websiteUrl: "https://acme.io",
    passwordType: "plain",
  };
  const resOrg = await http.post(orgUrl, orgPayload);
  handleResponse(resOrg, "Create Organization");

  // 5. CREAZIONE APPLICAZIONE PRIMEBRICK-API (Risolto con id=admin/...)
  console.log("\n--------------------------------------------------");
  // ⚠️ CRUCIALE: Per add-application l'id nell'URL deve avere sempre 'admin' come owner iniziale
  const appUrl = `/add-application?id=admin/${CASDOOR_CLIENT_ID}`;
  const appPayload = {
    owner: "admin", // Deve essere admin per l'entità applicazione globale
    name: CASDOOR_CLIENT_ID,
    displayName: "Primebrick API",
    organization: CASDOOR_ORGANIZATION, // Qui indichiamo che appartiene ad ACME
    enablePassword: true,
    enableSignUp: false,
    grantTypes: ["password", "authorization_code", "client_credentials"], // Formato camelCase per l'API
    redirectUris: ["http://localhost:3000/callback"] 
  };
  console.log(`📤 [POST] ${appUrl}`);
  const resApp = await http.post(appUrl, appPayload);
  handleResponse(resApp, "Create Application");

  // Recupero corretto del secret usando l'id standard di Casdoor
  const resGetApp = await http.get(`/get-application?id=admin/${CASDOOR_CLIENT_ID}`);
  if (!resGetApp.data?.data) {
    throw new Error(`❌ Fallimento critico: L'applicazione ${CASDOOR_CLIENT_ID} non esiste a sistema!`);
  }
  const generatedSecret = resGetApp.data.data.clientSecret;
  console.log(`🔑 [SECRET GENERATED] Secret per il tuo Backend Primebrick: "${generatedSecret}"`);

  // 6. CREAZIONE RUOLO ADMINISTRATORS
  console.log("\n--------------------------------------------------");
  const roleUrl = `/add-role?id=${CASDOOR_ORGANIZATION}/Administrators`;
  const rolePayload = {
    owner: CASDOOR_ORGANIZATION,
    name: "Administrators",
    displayName: "Administrators",
    description: "Administrators role",
  };
  const resRole = await http.post(roleUrl, rolePayload);
  handleResponse(resRole, "Create Role");

  // 7. CREAZIONE UTENTE ADMIN DENTRO ACME (Risolto con formato standard id=)
  console.log("\n--------------------------------------------------");
  // Per l'utente l'owner nell'URL deve rispecchiare l'organizzazione di appartenenza
  const userUrl = `/add-user?id=${CASDOOR_ORGANIZATION}/${CASDOOR_ADMIN_USERNAME}`;
  const userPayload = {
    owner: CASDOOR_ORGANIZATION,        
    name: CASDOOR_ADMIN_USERNAME,       
    displayName: "Primebrick Admin",
    email: CASDOOR_ADMIN_EMAIL,
    password: CASDOOR_ADMIN_PASSWORD,
    isAdmin: true,                      
    isGlobalAdmin: false,
    signupApplication: CASDOOR_CLIENT_ID, 
  };
  console.log(`📤 [POST] ${userUrl}`);
  const resUser = await http.post(userUrl, userPayload);
  handleResponse(resUser, "Create Admin User");

  // 8. ASSEGNAZIONE UTENTE -> RUOLO ADMINISTRATORS
  console.log("\n--------------------------------------------------");
  const assignUrl = `/update-role?id=${CASDOOR_ORGANIZATION}/Administrators`;
  const updateRolePayload = {
    owner: CASDOOR_ORGANIZATION,
    name: "Administrators",
    users: [`${CASDOOR_ORGANIZATION}/${CASDOOR_ADMIN_USERNAME}`]
  };
  console.log(`📤 [POST] ${assignUrl}`);
  const resAssign = await http.post(assignUrl, updateRolePayload);
  handleResponse(resAssign, "Assign User to Role");

  // 9. SALVATAGGIO DEI SEGRETI SU POSTGRES CORE (PRIMEBRICK)
  console.log("\n--------------------------------------------------");
  console.log("💾 [DB WRITE] Salvataggio configurazione finale sul DB Primebrick...");
  const pool = new Pool({ connectionString: BASE_DATABASE_URL });
  try {
    await updateAuthConfig(pool, "oidc_client_secret", generatedSecret, "setup-casdoor");
    await updateAuthConfig(pool, "casdoor_admin_password", CASDOOR_ADMIN_PASSWORD, "setup-casdoor");
    await updateAuthConfig(pool, "casdoor_builtin_client_secret", liveClientSecret, "setup-casdoor");
    console.log("  ↳ ✅ Configurazione salvata in tabella con successo.");
  } catch (dbErr: any) {
    console.error("❌ [DB WRITE ERROR] Errore su Postgres Core:", dbErr.message);
  } finally {
    await pool.end();
  }

  console.log("\n🏁 [FINE PIPELINE] Automazione completata con successo!");
}

main().catch((err) => {
  console.error("\n💥 [CRITICAL FALLBACK] Pipeline interrotta:", err.message);
  process.exit(1);
});

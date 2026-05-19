import "dotenv/config";

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_ADMIN_USERNAME = "admin";
const CASDOOR_ADMIN_PASSWORD = "123";
const CASDOOR_ORGANIZATION = "ACME";
const CASDOOR_TARGET_USER = "admin";

async function getJwtToken(): Promise<string> {
  const url = `${CASDOOR_ENDPOINT}/api/login/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: "cb05577e2097c31af3c7",
    client_secret: "47b2e05673a5307ccf0552e32ba45a18f6627f21",
    username: CASDOOR_ADMIN_USERNAME,
    password: CASDOOR_ADMIN_PASSWORD,
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
  return data.access_token;
}

async function main(): Promise<void> {
  const token = await getJwtToken();
  console.log("Got token:", token.substring(0, 20) + "...");

  // Get user by name via API
  const url = `${CASDOOR_ENDPOINT}/api/get-user?id=${CASDOOR_ORGANIZATION}/${CASDOOR_TARGET_USER}&accessToken=${token}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const user = await response.json();
    console.log("User found via API:", JSON.stringify(user, null, 2));
  } else {
    const text = await response.text();
    console.log("User not found via API:", text);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

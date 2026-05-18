import "dotenv/config";

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "http://localhost:8000";
const CASDOOR_ADMIN_USERNAME = "admin";
const CASDOOR_ADMIN_PASSWORD = "123";
const CASDOOR_ORGANIZATION = "ACME";
const CASDOOR_TARGET_USER = "admin";

async function getJwtToken(): Promise<string> {
  // Use OAuth with built-in app credentials
  const url = `${CASDOOR_ENDPOINT}/api/login/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: "client-id",
    client_secret: "client-secret",
    username: CASDOOR_ADMIN_USERNAME,
    password: CASDOOR_ADMIN_PASSWORD,
    scope: "",
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

  // Get user by name
  const url = `${CASDOOR_ENDPOINT}/api/get-user?id=${CASDOOR_ORGANIZATION}/${CASDOOR_TARGET_USER}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const user = await response.json();
    console.log("User found:", JSON.stringify(user, null, 2));
  } else {
    const text = await response.text();
    console.log("User not found or error:", text);
  }

  // List all users in the organization
  const listUrl = `${CASDOOR_ENDPOINT}/api/get-users?owner=${CASDOOR_ORGANIZATION}&limit=10`;
  const listResponse = await fetch(listUrl, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (listResponse.ok) {
    const users = await listResponse.json();
    console.log("Users in organization:", JSON.stringify(users, null, 2));
  } else {
    const text = await listResponse.text();
    console.log("Error listing users:", text);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

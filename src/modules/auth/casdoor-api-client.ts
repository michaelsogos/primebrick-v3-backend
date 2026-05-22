/**
 * Casdoor REST API client for admin operations.
 *
 * Uses Casdoor's built-in application credentials (clientId/clientSecret)
 * passed as query parameters to authenticate API calls.
 * Matches the pattern used in setup-casdoor.ts.
 */

export interface CasdoorUser {
  id: string;
  name: string;
  owner?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  customFields?: {
    app_avatar_color?: string;
    app_avatar_shape?: string;
    app_avatar_letters?: string;
  };
  isForbidden?: boolean;
  isAdmin?: boolean;
  roles?: Array<{ name: string; displayName?: string }>;
  [key: string]: unknown;
}

export interface CasdoorApiClientConfig {
  endpoint: string;
  orgName: string;
  clientId: string;
  clientSecret: string;
}

export class CasdoorApiClient {
  private endpoint: string;
  private orgName: string;
  private clientId: string;
  private clientSecret: string;

  constructor(config: CasdoorApiClientConfig) {
    this.endpoint = config.endpoint.replace(/\/$/, "");
    this.orgName = config.orgName;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  /**
   * Build API URL with clientId and clientSecret as query parameters.
   */
  private buildUrl(path: string): string {
    const url = new URL(`${this.endpoint}${path}`);
    url.searchParams.set("clientId", this.clientId);
    url.searchParams.set("clientSecret", this.clientSecret);
    return url.toString();
  }

  /**
   * GET /api/get-user?id=<userId>
   * If owner and name are provided, they override the userId splitting.
   */
  async getUser(userId: string, owner?: string, name?: string): Promise<CasdoorUser | null> {
    // Use explicitly passed owner/name if provided, otherwise split userId, otherwise use orgName
    const finalOwner = owner ?? (userId.includes('/') ? userId.split('/')[0] : this.orgName);
    const finalName = name ?? (userId.includes('/') ? userId.slice(userId.indexOf('/') + 1) : userId);
    const queryId = `${finalOwner}/${finalName}`;
    
    console.log(`[CasdoorApi] getUser: userId=${userId}, owner=${finalOwner}, name=${finalName}, queryId=${queryId}`);
    const url = this.buildUrl(`/api/get-user?id=${encodeURIComponent(queryId)}`);

    const response = await fetch(url);
    console.log(`[CasdoorApi] getUser response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[CasdoorApi] getUser response body: ${text}`);
      if (response.status === 404) {
        console.log(`[CasdoorApi] getUser: User not found (404): ${queryId}`);
        return null;
      }
      console.error(`[CasdoorApi] getUser failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`[CasdoorApi] getUser response data:`, JSON.stringify(data, null, 2));
    if (data.status === "error" || (!data.data && !data.name)) {
      return null;
    }
    return (data.data || data) as CasdoorUser;
  }

  /**
   * POST /api/update-user
   * Updates an existing user in Casdoor.
   * If user.owner and user.name are provided, they override the id splitting.
   */
  async updateUser(user: Partial<CasdoorUser> & { id: string }): Promise<boolean> {
    console.log(`[CasdoorApi] updateUser: userId=${user.id}, fields=${JSON.stringify(Object.keys(user).filter(k => k !== 'id'))}`);
    
    // Use explicitly passed owner/name if present, otherwise split id, otherwise use orgName
    const finalOwner = user.owner ?? (user.id.includes('/') ? user.id.split('/')[0] : this.orgName);
    const finalName = user.name ?? (user.id.includes('/') ? user.id.slice(user.id.indexOf('/') + 1) : user.id);
    const queryId = `${finalOwner}/${finalName}`;

    const url = this.buildUrl(`/api/update-user?id=${encodeURIComponent(queryId)}`);

    // MUST send id, owner, name in request body
    const requestBody: any = {
      id: user.id,           // UUID
      owner: finalOwner,
      name: finalName,
      displayName: user.displayName,
      email: user.email,
      // other updatable fields
    };

    // Add customFields and avatar if provided
    if (user.customFields) {
      requestBody.customFields = user.customFields;
    }
    if (user.avatar) {
      requestBody.avatar = user.avatar;
    }

    console.log(`[CasdoorApi] updateUser request: POST ${url}`);
    console.log(`[CasdoorApi] updateUser request body:`, JSON.stringify(requestBody, null, 2));
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    console.log(`[CasdoorApi] updateUser response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[CasdoorApi] updateUser response body: ${text}`);
      console.error(`[CasdoorApi] updateUser failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    console.log(`[CasdoorApi] updateUser response data:`, JSON.stringify(data, null, 2));
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/add-user
   * Creates a new user in Casdoor.
   */
  async addUser(user: Partial<CasdoorUser>): Promise<CasdoorUser | null> {
    console.log(`[CasdoorApi] addUser: username=${user.name}, email=${user.email}, roles=${JSON.stringify(user.roles?.map((r: any) => r.name))}`);
    const url = this.buildUrl("/api/add-user");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    console.log(`[CasdoorApi] addUser response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[CasdoorApi] addUser response body: ${text}`);
      console.error(`[CasdoorApi] addUser failed: ${response.status} ${text}`);
      return null;
    }

    const data = await response.json();
    console.log(`[CasdoorApi] addUser response data:`, JSON.stringify(data, null, 2));
    if (data.status !== "ok" && data.success !== true) {
      console.error(`[CasdoorApi] addUser returned error:`, data);
      return null;
    }

    return (data.data || data) as CasdoorUser;
  }

  /**
   * POST /api/delete-user
   * Physically deletes a user in Casdoor.
   * For soft-delete semantics, use updateUser({ isForbidden: true }) instead.
   * If owner and name are provided, they override the userId splitting.
   */
  async deleteUser(userId: string, owner?: string, name?: string): Promise<boolean> {
    console.log(`[CasdoorApi] deleteUser: userId=${userId}`);
    
    // Use explicitly passed owner/name if provided, otherwise split userId, otherwise use orgName
    const finalOwner = owner ?? (userId.includes('/') ? userId.split('/')[0] : this.orgName);
    const finalName = name ?? (userId.includes('/') ? userId.slice(userId.indexOf('/') + 1) : userId);
    const queryId = `${finalOwner}/${finalName}`;

    const url = this.buildUrl(`/api/delete-user?id=${encodeURIComponent(queryId)}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        owner: finalOwner,
        name: finalName,
      }),
    });
    console.log(`[CasdoorApi] deleteUser response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.log(`[CasdoorApi] deleteUser response body: ${text}`);
      console.error(`[CasdoorApi] deleteUser failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    console.log(`[CasdoorApi] deleteUser response data:`, JSON.stringify(data, null, 2));
    return data.status === "ok" || data.success === true;
  }
}

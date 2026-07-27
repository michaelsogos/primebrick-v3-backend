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

export interface CasdoorOrganization {
  name: string;
  displayName?: string;
  websiteUrl?: string;
  createdTime?: string;
  [key: string]: unknown;
}

/**
 * Casdoor role shape (camelCase dictated by Casdoor REST API — external
 * adapter boundary exception per the BE data-model rule).
 * `owner` = the Casdoor organization name (= `idp_org` in our DB).
 * `name`  = the role name (= `idp_role` in our DB).
 */
export interface CasdoorRole {
  owner: string;
  name: string;
  displayName?: string;
  description?: string;
  isEnabled?: boolean;
  createdTime?: string;
  [key: string]: unknown;
}

export interface CasdoorApiClientConfig {
  endpoint: string;
  orgName: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Casdoor MFA factor state (returned by setPreferred / delete).
 * camelCase field names are dictated by the Casdoor REST API — external
 * adapter boundary exception per the BE data-model rule.
 */
export interface CasdoorMfaFactor {
  enabled: boolean;
  isPreferred: boolean;
  mfaType: string;
  mfaRememberInHours?: number;
}

/**
 * Result of mfaSetupInitiate — mapped to snake_case for internal use.
 * The Casdoor API returns `data.url` (not `qr_code_url`); the client maps it.
 */
export interface CasdoorMfaInitiateResult {
  enabled: boolean;
  is_preferred: boolean;
  mfa_type: string;
  secret: string;
  qr_code_url: string;
  recovery_codes: string[];
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

    const url = this.buildUrl(`/api/get-user?id=${encodeURIComponent(queryId)}`);

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] getUser failed: ${response.status} ${text}`);
      if (response.status === 404) {
        console.error(`[CasdoorApi] getUser: User not found (404): ${queryId}`);
        return null;
      }
      return null;
    }

    const data = await response.json();
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
    // Add Casdoor boolean flags if provided
    if (user.isForbidden !== undefined) requestBody.isForbidden = user.isForbidden;
    if (user.isAdmin !== undefined) requestBody.isAdmin = user.isAdmin;
    if (user.isVerified !== undefined) requestBody.isVerified = user.isVerified;
    if (user.emailVerified !== undefined) requestBody.emailVerified = user.emailVerified;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] updateUser failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/set-password
   * Sets a new password for a Casdoor user.
   * Returns the raw Casdoor response so callers can check `status === "ok"` explicitly.
   */
  async changePassword(user: { id: string; owner?: string; name?: string }, newPassword: string): Promise<{ status: string; success?: boolean; msg?: string }> {
    const finalOwner = user.owner ?? (user.id.includes('/') ? user.id.split('/')[0] : this.orgName);
    const finalName = user.name ?? (user.id.includes('/') ? user.id.slice(user.id.indexOf('/') + 1) : user.id);
    const queryId = `${finalOwner}/${finalName}`;

    const url = this.buildUrl(`/api/set-password?id=${encodeURIComponent(queryId)}&newPassword=${encodeURIComponent(newPassword)}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] changePassword failed: ${response.status} ${text}`);
      return { status: "error", msg: text };
    }

    const data = await response.json();
    return data;
  }

  /**
   * POST /api/add-user
   * Creates a new user in Casdoor.
   */
  async addUser(user: Partial<CasdoorUser>): Promise<CasdoorUser | null> {
    const url = this.buildUrl("/api/add-user");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] addUser failed: ${response.status} ${text}`);
      return null;
    }

    const data = await response.json();
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

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] deleteUser failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  /**
   * GET /api/get-organization
   * Fetches an organization from Casdoor by name.
   */
  async getOrganization(name: string): Promise<CasdoorOrganization | null> {
    const orgId = `admin/${name}`;
    const url = this.buildUrl(`/api/get-organization?id=${encodeURIComponent(orgId)}`);

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] getOrganization failed: ${response.status} ${text}`);
      if (response.status === 404) {
        console.error(`[CasdoorApi] getOrganization: Organization not found (404): ${name}`);
        return null;
      }
      return null;
    }

    const data = await response.json();
    if (data.status === "error" || (!data.data && !data.name)) {
      return null;
    }
    return (data.data || data) as CasdoorOrganization;
  }

  /**
   * POST /api/update-organization
   * Updates an existing organization in Casdoor.
   */
  async updateOrganization(org: Partial<CasdoorOrganization> & { name: string }): Promise<boolean> {
    // Split name into owner and name parts (format: owner/name)
    const finalOwner = org.name.includes('/') ? org.name.split('/')[0] : this.orgName;
    const finalName = org.name.includes('/') ? org.name.slice(org.name.indexOf('/') + 1) : org.name;

    const url = this.buildUrl(`/api/update-organization?id=${encodeURIComponent(org.name)}`);

    const requestBody: any = {
      owner: finalOwner,
      name: finalName,
      displayName: org.displayName,
      websiteUrl: org.websiteUrl,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] updateOrganization failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/add-organization
   * Creates a new organization in Casdoor.
   */
  async addOrganization(org: Partial<CasdoorOrganization>): Promise<CasdoorOrganization | null> {
    const url = this.buildUrl("/api/add-organization");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(org),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] addOrganization failed: ${response.status} ${text}`);
      return null;
    }

    const data = await response.json();
    if (data.status !== "ok" && data.success !== true) {
      console.error(`[CasdoorApi] addOrganization returned error:`, data);
      return null;
    }

    return (data.data || data) as CasdoorOrganization;
  }

  /**
   * POST /api/delete-organization
   * Deletes an organization in Casdoor.
   */
  async deleteOrganization(name: string): Promise<boolean> {
    const url = this.buildUrl(`/api/delete-organization?id=${encodeURIComponent(name)}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] deleteOrganization failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/check-user-password
   * Verifies a user's current password against Casdoor.
   * Used by the self-service change-password flow to verify the old password
   * before allowing a change.
   *
   * Returns `{ status: "ok" | "error", msg?: string }`.
   */
  async checkUserPassword(
    user: { id: string; owner?: string; name?: string },
    password: string,
  ): Promise<{ status: "ok" | "error"; msg?: string }> {
    const finalOwner = user.owner ?? (user.id.includes("/") ? user.id.split("/")[0] : this.orgName);
    const finalName = user.name ?? (user.id.includes("/") ? user.id.slice(user.id.indexOf("/") + 1) : user.id);
    const queryId = `${finalOwner}/${finalName}`;

    const url = this.buildUrl(`/api/check-user-password?id=${encodeURIComponent(queryId)}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: queryId, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] checkUserPassword failed: ${response.status} ${text}`);
      return { status: "error", msg: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as { status?: string; msg?: string; data?: string };
    return { status: (data.status as "ok" | "error") ?? "error", msg: data.msg ?? data.data };
  }

  /**
   * GET /api/get-application
   * Fetches a Casdoor application by name (and owner).
   * Returns the raw application object or null if not found.
   */
  async getApplication(name: string, owner?: string): Promise<Record<string, unknown> | null> {
    const id = owner ? `${owner}/${name}` : name;
    const url = this.buildUrl(`/api/get-application?id=${encodeURIComponent(id)}`);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`[CasdoorApi] getApplication failed: ${response.status}`);
      return null;
    }

    const data = await response.json() as { status?: string; data?: Record<string, unknown> };
    if (data.status === "error" || !data.data) {
      return null;
    }
    return data.data;
  }

  /**
   * POST /api/update-application
   * Updates a Casdoor application. The `application` object must include the
   * full application fields (Casdoor replaces the entire object).
   * Returns true if the update succeeded.
   */
  async updateApplication(application: Record<string, unknown>): Promise<boolean> {
    const id = `${application.owner}/${application.name}`;
    const url = this.buildUrl(`/api/update-application?id=${encodeURIComponent(String(id))}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] updateApplication failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json() as { status?: string; success?: boolean };
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/add-application
   * Creates a new Casdoor application. Used when a new org is created and
   * no existing application is found for that org.
   * Returns the created application object or null on failure.
   */
  async addApplication(application: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const url = this.buildUrl("/api/add-application");

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] addApplication failed: ${response.status} ${text}`);
      return null;
    }

    const data = (await response.json()) as { status?: string; data?: Record<string, unknown> };
    if (data.status !== "ok" && data.status !== "success") {
      console.error(`[CasdoorApi] addApplication returned error:`, data);
      return null;
    }
    return data.data ?? application;
  }

  /**
   * Enable or disable WebAuthn on a Casdoor application.
   * Reads the current application, sets `enableWebAuthn`, and writes it back.
   * Best-effort: returns false if the application doesn't exist or the update fails.
   */
  async setApplicationWebAuthn(appName: string, appOwner: string, enabled: boolean): Promise<boolean> {
    const app = await this.getApplication(appName, appOwner);
    if (!app) {
      console.warn(`[CasdoorApi] setApplicationWebAuthn: application ${appOwner}/${appName} not found`);
      return false;
    }

    app.enableWebAuthn = enabled;
    return this.updateApplication(app);
  }

  // ─── Role management ──────────────────────────────────────────────────────
  //
  // Casdoor roles are org-scoped: the REST identity is `<owner>/<name>` where
  // `owner` is the Casdoor organization name. The `owner` parameter on these
  // methods is the `idp_org` selected from the FE org combobox (NOT a hardcoded
  // `this.orgName` fallback) — same pattern as `getUser(userId, owner?, name?)`.
  //
  // NOTE: camelCase field names (owner, name, displayName, isEnabled) are
  // dictated by the Casdoor REST API — external adapter boundary exception
  // per the BE data-model rule. The translation happens ONLY here.

  /**
   * GET /api/get-role?id=<owner>/<name>
   * Fetch a single role by its owner/name identity.
   * `owner` defaults to `this.orgName` when not provided (for backward compat
   * with seed roles that have no `idp_org`).
   * Returns null on 404 or error.
   */
  async getRole(name: string, owner?: string): Promise<CasdoorRole | null> {
    const finalOwner = owner ?? this.orgName;
    const roleId = `${finalOwner}/${name}`;
    const url = this.buildUrl(`/api/get-role?id=${encodeURIComponent(roleId)}`);

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] getRole failed: ${response.status} ${text}`);
      if (response.status === 404) {
        console.error(`[CasdoorApi] getRole: Role not found (404): ${roleId}`);
        return null;
      }
      return null;
    }

    const data = await response.json();
    if (data.status === "error" || (!data.data && !data.name)) {
      return null;
    }
    return (data.data || data) as CasdoorRole;
  }

  /**
   * POST /api/add-role?id=<owner>/<name>
   * Create a new role in Casdoor. `owner` is required (the Casdoor org name).
   * Returns the created role, or null on failure.
   */
  async addRole(role: Partial<CasdoorRole> & { name: string; owner: string }): Promise<CasdoorRole | null> {
    const roleId = `${role.owner}/${role.name}`;
    const url = this.buildUrl(`/api/add-role?id=${encodeURIComponent(roleId)}`);

    const requestBody = {
      owner: role.owner,
      name: role.name,
      displayName: role.displayName ?? role.name,
      description: role.description ?? "",
      isEnabled: role.isEnabled ?? true,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] addRole failed: ${response.status} ${text}`);
      return null;
    }

    const data = await response.json();
    if (data.status !== "ok" && data.success !== true) {
      console.error(`[CasdoorApi] addRole returned error:`, data);
      return null;
    }
    return (data.data || data) as CasdoorRole;
  }

  /**
   * POST /api/update-role?id=<owner>/<name>
   * Update an existing role in Casdoor. Only `displayName`, `description`, and
   * `isEnabled` are updatable — `owner` and `name` are immutable (the Casdoor
   * role identity). Returns true on success, false on failure.
   */
  async updateRole(role: Partial<CasdoorRole> & { name: string; owner: string }): Promise<boolean> {
    const roleId = `${role.owner}/${role.name}`;
    const url = this.buildUrl(`/api/update-role?id=${encodeURIComponent(roleId)}`);

    const requestBody: Record<string, unknown> = {
      owner: role.owner,
      name: role.name,
    };
    if (role.displayName !== undefined) requestBody.displayName = role.displayName;
    if (role.description !== undefined) requestBody.description = role.description;
    if (role.isEnabled !== undefined) requestBody.isEnabled = role.isEnabled;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] updateRole failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  /**
   * POST /api/delete-role?id=<owner>/<name>
   * Delete a role from Casdoor. `owner` is required (the Casdoor org name).
   * Returns true on success, false on failure.
   */
  async deleteRole(name: string, owner: string): Promise<boolean> {
    const roleId = `${owner}/${name}`;
    const url = this.buildUrl(`/api/delete-role?id=${encodeURIComponent(roleId)}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, name }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] deleteRole failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok" || data.success === true;
  }

  // ─── MFA (TOTP) management ────────────────────────────────────────────────
  //
  // Casdoor MFA endpoints are stateless when called with admin credentials
  // (clientId/clientSecret as query params). The BE acts as an admin proxy:
  //   - initiate: returns a TOTP secret + QR code URL + recovery codes
  //   - verify: validates a TOTP code against the secret (no session needed)
  //   - enable: persists the MFA factor on the Casdoor user (requires passcode)
  //   - setPreferred: marks the factor as preferred
  //   - delete: removes the MFA factor from the Casdoor user
  //
  // Verified working statelessly with Casdoor v3.118.0 (see spike notes).
  // camelCase field names (mfaType, passcode, recoveryCodes) are dictated by
  // the Casdoor REST API — external adapter boundary exception.

  /**
   * POST /api/mfa/setup/initiate?owner=<org>&name=<username>
   * Begin TOTP enrollment. Returns the secret, QR code URL, and recovery codes.
   * The secret must be shown to the user (QR code) and verified before enabling.
   */
  async mfaSetupInitiate(
    owner: string,
    name: string,
    mfaType: string = "app",
  ): Promise<CasdoorMfaInitiateResult> {
    const url = this.buildUrl(
      `/api/mfa/setup/initiate?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`,
    );
    const form = new URLSearchParams();
    form.append("mfaType", mfaType);

    console.log(`[CasdoorApi] mfaSetupInitiate: owner=${owner}, name=${name}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    console.log(`[CasdoorApi] mfaSetupInitiate response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] mfaSetupInitiate failed: ${response.status} ${text}`);
      throw new Error(`Casdoor mfaSetupInitiate failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    if (data.status === "error") {
      throw new Error(`Casdoor mfaSetupInitiate error: ${data.msg}`);
    }
    // Casdoor returns data.data with camelCase-ish fields; map to snake_case
    const d = data.data;
    return {
      enabled: d.enabled,
      is_preferred: d.isPreferred,
      mfa_type: d.mfaType,
      secret: d.secret,
      qr_code_url: d.url, // Casdoor uses "url", not "qr_code_url"
      recovery_codes: d.recoveryCodes || [],
    };
  }

  /**
   * POST /api/mfa/setup/verify
   * Validate a TOTP code against the secret. Stateless — no owner/name needed.
   * Returns true if the code is valid.
   */
  async mfaSetupVerify(
    mfaType: string,
    secret: string,
    passcode: string,
  ): Promise<boolean> {
    const url = this.buildUrl(`/api/mfa/setup/verify`);
    const form = new URLSearchParams();
    form.append("mfaType", mfaType);
    form.append("secret", secret);
    form.append("passcode", passcode);

    console.log(`[CasdoorApi] mfaSetupVerify: mfaType=${mfaType}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    console.log(`[CasdoorApi] mfaSetupVerify response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] mfaSetupVerify failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok";
  }

  /**
   * POST /api/mfa/setup/enable?owner=<org>&name=<username>
   * Persist the MFA factor on the Casdoor user. Requires a fresh TOTP passcode
   * (not just the secret + recovery codes). The passcode must be generated from
   * the secret at the current time step.
   */
  async mfaSetupEnable(
    owner: string,
    name: string,
    mfaType: string,
    secret: string,
    passcode: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const url = this.buildUrl(
      `/api/mfa/setup/enable?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`,
    );
    const form = new URLSearchParams();
    form.append("mfaType", mfaType);
    form.append("secret", secret);
    form.append("passcode", passcode);
    form.append("recoveryCodes", recoveryCode);

    console.log(`[CasdoorApi] mfaSetupEnable: owner=${owner}, name=${name}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    console.log(`[CasdoorApi] mfaSetupEnable response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] mfaSetupEnable failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok";
  }

  /**
   * POST /api/set-preferred-mfa?owner=<org>&name=<username>
   * Mark an MFA factor as preferred (shown first in challenge UI).
   */
  async setPreferredMfa(
    owner: string,
    name: string,
    mfaType: string,
  ): Promise<boolean> {
    const url = this.buildUrl(
      `/api/set-preferred-mfa?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`,
    );
    const form = new URLSearchParams();
    form.append("mfaType", mfaType);

    console.log(`[CasdoorApi] setPreferredMfa: owner=${owner}, name=${name}, mfaType=${mfaType}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    console.log(`[CasdoorApi] setPreferredMfa response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] setPreferredMfa failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok";
  }

  /**
   * POST /api/delete-mfa?owner=<org>&name=<username>
   * Remove an MFA factor from the Casdoor user.
   */
  async deleteMfa(
    owner: string,
    name: string,
    mfaType: string,
  ): Promise<boolean> {
    const url = this.buildUrl(
      `/api/delete-mfa?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`,
    );
    const form = new URLSearchParams();
    form.append("mfaType", mfaType);

    console.log(`[CasdoorApi] deleteMfa: owner=${owner}, name=${name}, mfaType=${mfaType}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    console.log(`[CasdoorApi] deleteMfa response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CasdoorApi] deleteMfa failed: ${response.status} ${text}`);
      return false;
    }

    const data = await response.json();
    return data.status === "ok";
  }
}

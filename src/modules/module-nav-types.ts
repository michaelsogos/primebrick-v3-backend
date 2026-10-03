/**
 * Module navigation metadata types.
 *
 * Shared between the /modules list endpoint (ModuleInfo fields) and the
 * /modules/:code/meta endpoint (full nav tree). All field names are
 * snake_case per the BE data-model convention.
 */

export type ModuleNavLink = {
  id: string;
  label_key: string;
  href: string;
  icon?: string;
  children?: ModuleNavLink[];
};

export type ModuleNav = {
  module: string;
  icon?: string;
  nav: ModuleNavLink[];
};

/**
 * A declared frontend route owned by a module. Modules MUST declare every
 * FE path they own that is not deducible from nav links or entity
 * conventions — the AI route census (GET /system/routes) depends on it.
 * `param` marks dynamic segments using the FE convention ([uuid], [code]).
 */
export type ModuleRouteDecl = {
  route: string;
  kind: "list" | "detail" | "create" | "page";
  /** Entity code when the route is bound to a CRUD surface. */
  entity?: string;
  /** i18n key for a human-readable label, when available. */
  label_key?: string;
};

/**
 * Extended with route_prefixes + is_reserved — used internally by the
 * /modules list endpoint to attach route resolution metadata. The
 * /modules/:code/meta endpoint strips these and returns plain ModuleNav.
 */
export type ModuleNavWithPrefixes = ModuleNav & {
  route_prefixes: string[];
  is_reserved?: boolean;
  /** Full route census of the module — nav-declared AND non-derivable paths. */
  routes?: ModuleRouteDecl[];
};

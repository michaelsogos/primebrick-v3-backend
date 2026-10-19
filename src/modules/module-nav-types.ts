/**
 * Module navigation metadata types.
 *
 * Shared between the /modules list endpoint (ModuleInfo fields) and the
 * /modules/:code/meta endpoint (full nav tree). All field names are
 * snake_case per the BE data-model convention.
 */

import type { PageRouteDeclaration } from "@primebrick/sdk";

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
 * A declared frontend route owned by a module. The canonical contract lives
 * in `@primebrick/core` (`PageRouteDeclaration`) — it carries optional remote
 * component delivery fields (`component_url`/`component_format`/`integrity`)
 * consumed by the FE `RemotePageMount`.
 */
export type ModuleRouteDecl = PageRouteDeclaration;

export type { PageRouteDeclaration };

/**
 * Extended with route_prefixes + is_reserved — used internally by the
 * /modules list endpoint to attach route resolution metadata. The
 * /modules/:code/meta endpoint strips these and returns plain ModuleNav.
 */
export type ModuleNavWithPrefixes = ModuleNav & {
  route_prefixes: string[];
  is_reserved?: boolean;
  /** Full route census of the module — nav-declared AND non-derivable paths. */
  routes?: PageRouteDeclaration[];
};

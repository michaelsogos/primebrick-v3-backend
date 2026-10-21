/**
 * Module navigation metadata types — facades over the canonical contracts
 * in `@primebrick/core`.
 *
 * Shared between the /modules discovery payload (nav + routes + home),
 * the client-derived route census, and the service-registration
 * self-declaration (`service_registry.endpoints.nav`).
 * All field names are snake_case per the BE data-model convention.
 */

import type {
  ModuleNavDeclaration as CoreModuleNavDeclaration,
  ModuleNavLink,
  PageRouteDeclaration,
} from "@primebrick/sdk";

export type { ModuleNavLink, PageRouteDeclaration };

export type ModuleNav = {
  module: string;
  nav: ModuleNavLink[];
};

/**
 * A declared frontend route owned by a module. The canonical contract lives
 * in `@primebrick/core` (`PageRouteDeclaration`) — it carries optional remote
 * component delivery fields (`component_url`/`component_format`/`integrity`)
 * consumed by the FE `RemotePageMount`.
 */
export type ModuleRouteDecl = PageRouteDeclaration;

/**
 * A module's full nav declaration — the shape services self-publish via
 * `service.register` (`endpoints.nav`) AND the shape the static MODULE_NAV
 * registry returns for BE-owned modules. One contract, two sources:
 * service-declared nav is the wiring; static nav is only for the BE's own
 * reserved/system modules.
 */
export type ModuleNavWithPrefixes = CoreModuleNavDeclaration & {
  /** Module code — always populated when resolved (static or endpoints). */
  module: string;
};

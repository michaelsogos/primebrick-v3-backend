/**
 * DocsPackService — serves the BE's built documentation pack
 * (`dist/docs-pack/`, produced by `pnpm generate:docs` → SDK buildDocsPack).
 * Transport-agnostic: returns the formed payload, the controller serializes.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseDocsPackPayload, extJsonParse, type DocsPackPayload } from "@primebrick/sdk";
import { NotFoundError } from "../../http/api-errors.js";

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFilesRecursive(full));
    else out.push(full);
  }
  return out;
}

export class DocsPackService {
  constructor(private readonly packDir = join(process.cwd(), "dist", "docs-pack")) {}

  getPack(): DocsPackPayload {
    const manifestPath = join(this.packDir, "manifest.json");
    const docsDir = join(this.packDir, "docs");
    if (!existsSync(manifestPath) || !existsSync(docsDir)) {
      throw new NotFoundError("Docs pack not built — run `pnpm generate:docs`", {
        internal_code: "DOCS_PACK_NOT_BUILT",
      });
    }
    const manifest = extJsonParse(readFileSync(manifestPath, "utf-8"));
    const files = listFilesRecursive(docsDir).map((full) => ({
      path: relative(docsDir, full).split(sep).join("/"),
      content: readFileSync(full, "utf-8"),
    }));
    const openapiPath = join(this.packDir, "openapi.json");
    const openapi = existsSync(openapiPath) ? readFileSync(openapiPath, "utf-8") : undefined;
    return parseDocsPackPayload({ manifest, files, openapi });
  }
}

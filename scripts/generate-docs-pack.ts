/**
 * Builds dist/docs-pack for the backend:
 *   1. regenerates the metadata-derived pages into docs/user-guide/generated/
 *   2. copies docs/user-guide verbatim into the pack (SDK buildDocsPack)
 * Run via `pnpm generate:docs`.
 */
import { join } from "node:path";
import { buildDocsPack } from "@primebrick/sdk";
import { generateReferenceDocs } from "./generate-reference-docs.js";
import { openapi } from "../src/openapi/openapi.js";

await generateReferenceDocs(join(process.cwd(), "docs", "user-guide", "generated"));

const manifest = await buildDocsPack({
  repo: "backend",
  docsDir: "docs/user-guide",
  outDir: "dist/docs-pack",
  openapi: openapi as Record<string, unknown>,
});
console.log(`docs pack built: ${manifest.files.length} files${manifest.has_openapi ? " + openapi" : ""} → dist/docs-pack`);

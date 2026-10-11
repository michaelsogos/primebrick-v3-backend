/**
 * Builds dist/docs-pack for the backend — copies docs/user-guide verbatim
 * and writes manifest.json (SDK buildDocsPack). Run via `pnpm generate:docs`.
 */
import { buildDocsPack } from "@primebrick/sdk";

const manifest = await buildDocsPack({
  repo: "backend",
  docsDir: "docs/user-guide",
  outDir: "dist/docs-pack",
});
console.log(`docs pack built: ${manifest.files.length} files → dist/docs-pack`);

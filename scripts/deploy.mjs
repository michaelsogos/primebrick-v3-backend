#!/usr/bin/env node
/**
 * deploy.mjs — produce a self-contained deployable dir for the backend via
 * `pnpm deploy`.
 *
 * Usage:
 *   node scripts/deploy.mjs
 *
 * Same mechanism as primebrick-us-v3/scripts/deploy-service.mjs: builds the
 * package (full prebuild chain), then `pnpm deploy --prod` with workspace
 * injection enabled at invocation time only, then pins `workspace:*`
 * specifiers in the emitted package.json to the injected versions.
 * Output: <primebrick>/temp/deploy-out/be/ — the Docker build context:
 *   docker build -f primebrick-be-v3/Dockerfile <primebrick>/temp/deploy-out/be
 *
 * Requires the pnpm workspace (discovered as a sibling dir holding
 * pnpm-workspace.yaml whose `packages:` cover this repo).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgName = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8")).name;
const repoName = repoRoot.split(/[\\/]/).pop();

const reposParent = dirname(repoRoot);
const wsCandidates = readdirSync(reposParent, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(reposParent, d.name, "pnpm-workspace.yaml"))
  .filter((p) => existsSync(p) && readFileSync(p, "utf-8").includes(repoName));
if (wsCandidates.length !== 1) {
  console.error(
    wsCandidates.length === 0
      ? "no sibling pnpm-workspace.yaml covering this repo — deploy requires the pnpm workspace"
      : `ambiguous workspace roots: ${wsCandidates.join(", ")}`,
  );
  process.exit(1);
}
const wsRoot = dirname(wsCandidates[0]);

const outDir = join(dirname(wsRoot), "temp", "deploy-out", "be");
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(dirname(outDir), { recursive: true });

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const run = (args, cwd = wsRoot) => {
  console.log(`$ pnpm ${args.join(" ")}`);
  const r = spawnSync(pnpm, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run(["--filter", pkgName, "run", "build"]);
run([
  "--config.inject-workspace-packages=true",
  "--filter", pkgName,
  "deploy", "--prod", outDir,
]);

const deployedPkgPath = join(outDir, "package.json");
const deployedPkg = JSON.parse(readFileSync(deployedPkgPath, "utf-8"));
for (const [dep, spec] of Object.entries(deployedPkg.dependencies ?? {})) {
  if (!spec.startsWith("workspace:")) continue;
  const { version } = JSON.parse(
    readFileSync(join(outDir, "node_modules", dep, "package.json"), "utf-8"),
  );
  deployedPkg.dependencies[dep] = version;
  console.log(`pinned ${dep} → ${version}`);
}
writeFileSync(deployedPkgPath, JSON.stringify(deployedPkg, null, 2) + "\n");

console.log(`\ndeployed → ${outDir}`);
console.log(`docker build -f primebrick-be-v3/Dockerfile ${outDir}`);

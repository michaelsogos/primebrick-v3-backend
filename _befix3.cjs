const fs = require("fs");
let f = "src/http/entity-write.ts";
let s = fs.readFileSync(f, "utf8");
s = s.replace("const VersionQuerySchema = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);", "const VersionQuerySchema = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).transform(BigInt);");
s = s.replace("export function requireVersionQuery(req: Request): number {", "export function requireVersionQuery(req: Request): bigint {");
fs.writeFileSync(f, s);
console.log("central helper fixed");

const fs = require("fs");
let f = "src/controllers/http/auth/config-entries.router.ts";
let s = fs.readFileSync(f, "utf8");
s = s.replace(/z\.union\(\[z\.number\(\)\.int\(\)\.min\(1\), z\.bigint\(\)\]\)/g, "z.union([z.number().int().min(1), z.bigint()]).transform(BigInt)");
s = s.replace(/Number\(req\.query\.version\) : \(undefined as unknown as number\)/g, "BigInt(req.query.version as string) : (undefined as unknown as bigint)");
fs.writeFileSync(f, s);
console.log("zod transforms added");

const fs = require("fs");
// router: Number() conversions become BigInt() — boundary conversion into domain type
let f1 = "src/controllers/http/auth/config-entries.router.ts";
let s1 = fs.readFileSync(f1, "utf8");
s1 = s1.replace(/version: Number\(body\.entity\.version\)/g, "version: BigInt(body.entity.version)");
fs.writeFileSync(f1, s1);
console.log("router BigInt conversions done");

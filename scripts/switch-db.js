const fs = require("fs");
const path = require("path");

const target = process.argv[2]; // 'postgres' or 'sqlite'

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let content = fs.readFileSync(schemaPath, "utf-8");

if (target === "postgres" || target === "postgresql") {
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("Successfully switched Prisma provider to 'postgresql' for Vercel/Neon deployment!");
} else if (target === "sqlite") {
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("Successfully switched Prisma provider to 'sqlite' for local development!");
} else {
  console.log("Usage: node scripts/switch-db.js <sqlite|postgres>");
}

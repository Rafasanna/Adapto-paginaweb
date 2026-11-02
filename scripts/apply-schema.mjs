// Ejecuta docs/neon-schema.sql contra DATABASE_URL (idempotente).
// Uso: npm run db:schema
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL (en .env.local).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const file = await readFile(new URL("../docs/neon-schema.sql", import.meta.url), "utf8");

// El esquema no tiene funciones ni bloques $$, así que se puede separar por ";".
const statements = file
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const tables = await sql`
  select table_name from information_schema.tables
  where table_schema = 'public' order by table_name
`;
console.log(`Esquema aplicado (${statements.length} sentencias). Tablas: ${tables.map((t) => t.table_name).join(", ")}`);

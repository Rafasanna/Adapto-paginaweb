// Crea o actualiza una usuaria del admin en Neon.
// Uso: npm run create-admin -- email@ejemplo.com "Nombre"
// Si el email ya existe, actualiza el nombre y la contraseña.
// La contraseña se pide por teclado (no se muestra ni queda en el historial).
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const [, , emailArg, nameArg = "Admin"] = process.argv;

if (!emailArg) {
  console.error('Uso: npm run create-admin -- email@ejemplo.com "Nombre"');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL (en .env.local).");
  process.exit(1);
}

const email = String(emailArg).trim().toLowerCase();
const password = await askHidden("Contraseña: ");
const confirmation = await askHidden("Repetir contraseña: ");

if (password !== confirmation) {
  console.error("Las contraseñas no coinciden.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("La contraseña debe tener al menos 10 caracteres.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 12);

const [admin] = await sql`
  insert into admin_users (email, name, password_hash, role, active)
  values (${email}, ${nameArg}, ${passwordHash}, 'admin', true)
  on conflict (email) do update
  set name = excluded.name,
      password_hash = excluded.password_hash,
      active = true,
      updated_at = now()
  returning id, email
`;

console.log(`Usuaria lista: ${admin.email}. Ya puede entrar en /admin/login`);

function askHidden(prompt) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(prompt);
    let value = "";
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    // Recorre carácter por carácter para que también funcione al pegar.
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          stdout.write("\n");
          process.exit(1);
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

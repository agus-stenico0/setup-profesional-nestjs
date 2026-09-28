import { envSchema, Env } from "./env.schema.js";

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `  ✗ ${i.path.join('.') || '(general)'}: ${i.message}`)
      .join('\n');
    throw new Error(`\n\n❌ Configuración inválida:\n\n${detail}\n\nRevisá el .env\n`);
  }
  return result.data;
}
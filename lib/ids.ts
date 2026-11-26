import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Eindeutige, gut lesbare Fallnummer, z. B. BN-20261126-7KQ4X. */
export function newCaseId(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `BN-${d}-${randomCode(5)}`;
}

export function newId(): string {
  return randomBytes(12).toString("hex");
}

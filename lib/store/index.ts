import { config } from "@/lib/config";
import { FileStore } from "@/lib/store/file-store";
import { SupabaseStore } from "@/lib/store/supabase-store";
import type { Store } from "@/lib/store/types";

let store: Store | null = null;

export function getStore(): Store {
  if (store) return store;
  const url = config.supabaseUrl;
  const key = config.supabaseServiceRoleKey;
  if (url && key) {
    store = new SupabaseStore(url, key);
  } else {
    // Auf Vercel ohne Supabase: nur temporärer Speicher (/tmp) für einen schnellen Test.
    // Daten können jederzeit verloren gehen – für den echten Pilot Supabase einrichten.
    store = new FileStore(process.env.VERCEL ? "/tmp/bildungsnavigator" : config.dataDir);
  }
  return store;
}

export function storageBackend(): "supabase" | "lokal" | "temporaer" {
  if (config.supabaseUrl && config.supabaseServiceRoleKey) return "supabase";
  return process.env.VERCEL ? "temporaer" : "lokal";
}

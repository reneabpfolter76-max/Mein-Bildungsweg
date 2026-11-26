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
    if (process.env.VERCEL) {
      throw new Error("Auf Vercel ist Supabase erforderlich: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY setzen.");
    }
    store = new FileStore(config.dataDir);
  }
  return store;
}

export function storageBackend(): "supabase" | "lokal" {
  return config.supabaseUrl && config.supabaseServiceRoleKey ? "supabase" : "lokal";
}

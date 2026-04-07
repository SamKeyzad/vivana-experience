import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null | undefined = undefined;

export function getSupabase(): SupabaseClient | null {
  if (_supabase === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    _supabase = url && key
      ? createClient(url, key, { auth: { flowType: "implicit" } })
      : null;
    if (!_supabase) console.warn("Supabase env vars missing — auth/db disabled");
  }
  return _supabase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function noOpProxy(): any {
  return new Proxy(() => Promise.resolve({ data: null, error: null }), {
    get: () => noOpProxy(),
    apply: () => Promise.resolve({ data: null, error: null }),
  });
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) return noOpProxy();
    return (client as never)[prop as keyof SupabaseClient];
  },
});

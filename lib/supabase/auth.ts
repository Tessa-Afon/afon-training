// Supabase Auth for staff sign-in, with the session kept in cookies.
// Uses the public (anon) key: it can sign people in but read no data.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const AUTH_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function authClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          // Server components can't set cookies; proxy.ts refreshes the
          // session on every admin request, so this is safe to skip.
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}

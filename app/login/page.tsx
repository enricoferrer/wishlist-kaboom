"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Wishlist Kaboom</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Cole o link de um produto e guarde nome, imagem e preço num só lugar.
        </p>
      </div>
      <button
        onClick={handleLogin}
        className="flex items-center gap-3 rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Entrar com Google
      </button>
    </div>
  );
}

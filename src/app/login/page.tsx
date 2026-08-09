"use client";

import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.89c2.28-2.1 3.56-5.2 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.13 0-5.78-2.11-6.72-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.6H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden="true">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="M19 15l.9 2.6L22.5 18.5 19.9 19.4 19 22l-.9-2.6L15.5 18.5 18.1 17.6 19 15Z" />
    </svg>
  );
}

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
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
      <div className="blob animate-blob -left-32 top-10 h-80 w-80" />
      <div className="blob animate-blob right-[-6rem] bottom-0 h-72 w-72" style={{ animationDelay: "-7s" }} />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-cta text-primary-fg shadow-glow">
          <IconSparkles />
        </span>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient sm:text-4xl">
            Wishlist Kaboom
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
            Sua lista de desejos sempre em um só lugar!
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="flex items-center gap-3 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
        >
          <GoogleLogo />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

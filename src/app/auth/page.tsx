"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dot-grid overflow-hidden">
      {/* Dynamic Animated Glow */}
      <motion.div
        className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-cyan-vibrant/5 blur-[120px]"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 50, restDelta: 0.001 }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-6"
      >
        <div className="glass-panel relative flex flex-col items-center justify-center rounded-3xl border border-dark-border p-8 shadow-2xl transition-all">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-vibrant/20 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Shield className="h-8 w-8 text-cyan-vibrant" />
          </div>
          
          <h1 className="mt-6 font-syne text-3xl font-bold tracking-tight text-white">ReviewRadar</h1>
          <p className="mt-2 text-center text-muted-foreground">Don't trust blindly. Analyse first.</p>
          
          <div className="mt-10 w-full space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-dark-surface px-6 py-4 text-sm font-semibold text-white border border-dark-border transition-all hover:bg-dark-border hover:border-cyan-vibrant/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-vibrant" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
              <ArrowRight className="absolute right-6 h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest leading-loose">
              We never store your personal data
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

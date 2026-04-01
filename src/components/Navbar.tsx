"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Shield, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && window.location.pathname !== "/auth") {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-dark-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Shield className="h-8 w-8 text-cyan-vibrant transition-transform group-hover:scale-110" />
            <span className="font-syne text-xl font-bold tracking-tight text-white">ReviewRadar</span>
          </Link>
          
          {user && (
            <Link 
              href="/history" 
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-cyan-vibrant transition-colors"
            >
              History
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium text-white">{user.user_metadata.full_name || user.email}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              {(() => {
                const avatarUrl = user?.user_metadata?.avatar_url;
                const initials = user?.user_metadata?.full_name
                  ?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                  ?? user?.email?.[0]?.toUpperCase()
                  ?? "U";
                return avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full border border-dark-border"
                    onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-sm font-semibold text-black">
                    {initials}
                  </div>
                );
              })()}
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg bg-dark-surface px-3 py-2 text-sm font-medium text-white border border-dark-border transition-all hover:bg-dark-border hover:border-cyan-vibrant/30"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="rounded-lg bg-cyan-vibrant px-4 py-2 text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

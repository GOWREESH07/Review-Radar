"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Search, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Repeat, 
  MessageSquare, 
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const steps = [
    {
      id: "01",
      icon: Search,
      title: "Paste your product link",
      description: "Any Amazon or Flipkart URL will work instantly."
    },
    {
      id: "02",
      icon: Zap,
      title: "We fetch and scan reviews",
      description: "Our engine analyses over 30+ real-time signals."
    },
    {
      id: "03",
      icon: BarChart3,
      title: "Get a full credibility report",
      description: "Identify fake spikes and suspicious patterns."
    }
  ];

  const signals = [
    {
      icon: TrendingUp,
      title: "Burst Detection",
      description: "Spike of reviews in short time intervals."
    },
    {
      icon: MessageSquare,
      title: "Text Similarity",
      description: "Identification of repeated phrases and patterns."
    },
    {
      icon: Repeat,
      title: "Repeat Users",
      description: "Flagging multiple reviews from the same account."
    },
    {
      icon: Zap,
      title: "Sentiment Skew",
      description: "Detection of unnatural all-5-star patterns."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-cyan-vibrant selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-vibrant/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-cyan-vibrant/5 blur-[80px] rounded-full" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-syne text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-tight"
            >
              Are those <span className="text-cyan-vibrant drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">reviews real?</span>
            </motion.h1>
            
            <motion.p 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              Paste any Amazon or Flipkart product link. We detect fake reviews, burst patterns, and suspicious activity — in seconds.
            </motion.p>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <Link
                href="/analyse"
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-cyan-vibrant px-8 text-lg font-bold text-black transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95"
              >
                Paste a link <ArrowRight className="h-5 w-5" /> See credibility score
              </Link>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { label: "10+ signals analysed", icon: Zap },
                { label: "Amazon & Flipkart", icon: LayoutGrid },
                { label: "Free to use", icon: ShieldCheck }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-surface/50 py-4 px-6">
                  <stat.icon className="h-4 w-4 text-cyan-vibrant" />
                  <span className="text-sm font-medium text-white">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-dark-border bg-dark-surface/10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center font-syne text-3xl font-bold text-white sm:text-4xl">How ReviewRadar works</h2>
            
            <div className="mt-20 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-dark-border -translate-y-1/2 hidden lg:block" />
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
                {steps.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-surface border-2 border-dark-border text-cyan-vibrant group-hover:border-cyan-vibrant transition-all shadow-xl">
                      <step.icon className="h-8 w-8" />
                      <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-vibrant text-black text-sm font-bold">
                        {step.id}
                      </div>
                    </div>
                    <h3 className="mt-8 font-syne text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed px-4">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SIGNALS SECTION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col items-center text-center">
              <h2 className="font-syne text-3xl font-bold text-white sm:text-4xl">What we detect</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">
                Our analysis engine evaluates multiple risk factors to determine the authenticity of a product's review profile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-32">
              {signals.map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border-l-4 border-cyan-vibrant bg-dark-surface p-8 transition-all hover:bg-dark-border hover:shadow-[0_0_20px_rgba(0,229,255,0.05)]"
                >
                  <signal.icon className="h-8 w-8 text-cyan-vibrant" />
                  <h3 className="mt-6 font-syne text-xl font-bold text-white">{signal.title}</h3>
                  <p className="mt-2 text-muted-foreground">{signal.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SUPPORTED PLATFORMS */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-dark-border">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-syne text-2xl font-bold text-white uppercase tracking-widest">Works on</h2>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3 rounded-full bg-dark-surface border border-dark-border px-8 py-4 transition-all hover:border-orange-500/50 hover:bg-orange-500/5 group">
                <span className="text-2xl">📦</span>
                <span className="font-syne text-xl font-bold text-white group-hover:text-orange-500 transition-colors">Amazon.in</span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-dark-surface border border-dark-border px-8 py-4 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 group">
                <span className="text-2xl">🛒</span>
                <span className="font-syne text-xl font-bold text-white group-hover:text-blue-500 transition-colors">Flipkart</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-dark-border py-12 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-vibrant" />
            <span className="font-syne text-lg font-bold text-white">ReviewRadar</span>
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Built to help you shop smarter</p>
          <p className="text-xs text-muted-foreground mt-4">&copy; 2026 ReviewRadar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

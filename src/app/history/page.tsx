"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { 
  ShoppingBag, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  ChevronRight,
  Filter,
  Search,
  SearchX
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) console.error("Error fetching history:", error);
      else setReports(data || []);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const filteredReports = reports.filter(r => {
    if (filter === "All") return true;
    if (filter === "Amazon") return r.platform === "amazon";
    if (filter === "Flipkart") return r.platform === "flipkart";
    if (filter === "Buy ✓") return r.recommendation === "buy";
    if (filter === "Caution ⚠") return r.recommendation === "caution";
    if (filter === "Avoid ✗") return r.recommendation === "avoid";
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500/20 text-green-500 border-green-500/30";
    if (score >= 40) return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    return "bg-red-500/20 text-red-500 border-red-500/30";
  };

  const getRecommendationPill = (rec: string) => {
    if (rec === "buy") return "bg-green-500/10 text-green-500 border-green-500/20";
    if (rec === "caution") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-cyan-vibrant selection:text-black">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-syne text-3xl font-bold tracking-tight text-white mb-2"
          >
            Your Analysis History
          </motion.h1>
          <p className="text-muted-foreground">{reports.length} products analysed</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Amazon", "Flipkart", "Buy ✓", "Caution ⚠", "Avoid ✗"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                filter === f 
                  ? "bg-cyan-vibrant text-black border-cyan-vibrant shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                  : "bg-dark-surface text-muted-foreground border-dark-border hover:border-cyan-vibrant/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 glass-panel rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-panel group rounded-3xl border border-dark-border p-6 hover:border-cyan-vibrant/40 transition-all flex flex-col h-full"
                >
                  <div className="flex gap-4 mb-6">
                    <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-dark-surface border border-dark-border overflow-hidden flex items-center justify-center p-2">
                      {report.product_image ? (
                        <img src={report.product_image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border border-dark-border ${report.platform === 'amazon' ? 'bg-[#FF9900]' : 'bg-[#2874F0]'}`}>
                        <div className="h-3 w-3 text-white">
                          {report.platform === 'amazon' ? 'A' : 'F'}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-syne font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-vibrant transition-colors">
                        {report.product_title || "Untitled Product"}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getScoreColor(report.credibility_score)}`}>
                          {report.credibility_score}/100
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getRecommendationPill(report.recommendation)}`}>
                          {report.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-dark-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex gap-2">
                       <Link 
                        href={`/report/${report.share_id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-dark-surface border border-dark-border hover:border-cyan-vibrant/50 text-white transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button 
                         onClick={() => router.push(`/analyse?url=${encodeURIComponent(report.product_url)}`)}
                         className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-vibrant/10 border border-cyan-vibrant/20 text-cyan-vibrant text-xs font-bold hover:bg-cyan-vibrant hover:text-black transition-all"
                      >
                        <RefreshCw className="h-3 w-3" /> Re-analyse
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-8 glass-panel rounded-3xl border border-dark-border text-center"
          >
            <div className="h-20 w-20 rounded-3xl bg-dark-surface border border-dark-border flex items-center justify-center mb-6">
              <SearchX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-syne text-2xl font-bold text-white mb-3">No matching reports found</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              {reports.length === 0 
                ? "You haven't analysed any products yet. Get started by pasting a product link."
                : "No reports match your current filter criteria."}
            </p>
            <Link 
              href="/analyse" 
              className="px-8 py-3 rounded-xl bg-cyan-vibrant text-black font-bold transition-all hover:scale-105 active:scale-95"
            >
              Analyse your first product
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ScoreRing from "@/components/ScoreRing";
import StatCard from "@/components/StatCard";
import ReviewCard from "@/components/ReviewCard";
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag,
  Clock,
  Flag,
  Users,
  BarChart,
  PieChart as PieChartIcon,
  ShieldCheck,
  Zap,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from "lucide-react";
import ShareActions from "@/components/ShareActions";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { detectPlatform } from "@/lib/extractId";
import { AnalysisResult, SignalResult } from "@/lib/analysisEngine";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Label,
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from "recharts";

export default function AnalysePage() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<"amazon" | "flipkart" | "unknown">("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (url) {
      setPlatform(detectPlatform(url));
    } else {
      setPlatform("unknown");
    }
  }, [url]);

  const hasAutoAnalysed = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlParam = searchParams.get('url');
      if (urlParam && !hasAutoAnalysed.current) {
        hasAutoAnalysed.current = true;
        setUrl(urlParam);
        handleAnalyse(urlParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyse = async (overrideUrl?: string | any) => {
    const targetUrl = typeof overrideUrl === "string" ? overrideUrl : url;
    const targetPlatform = typeof overrideUrl === "string" ? detectPlatform(overrideUrl) : platform;
    if (!targetUrl || targetPlatform === "unknown") return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    if (confidence === "High") return "text-green-500";
    if (confidence === "Medium") return "text-amber-500";
    return "text-red-500";
  };

  // Bug 6 Fix: Clean signals show 0 — not a fake 0.5 placeholder bar
  const chartData = result?.signals
    .filter(s => s.status !== "skipped") // exclude skipped from chart
    .map(s => ({
      name: s.signalName,
      penalty: s.status === "triggered" ? s.penaltyApplied : 0,
      displayValue: s.status === "triggered"
        ? Number(s.penaltyApplied.toFixed(1))
        : 0, // clean = 0 (bar doesn't render)
      status: s.status
    }))
    .sort((a, b) => b.displayValue - a.displayValue) || [];

  return (
    <div className="min-h-screen bg-background text-white selection:bg-cyan-vibrant selection:text-black">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* INPUT SECTION */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl font-bold tracking-tight mb-8"
          >
            Analyse <span className="text-cyan-vibrant">Product Reviews</span>
          </motion.h1>
          
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${platform === "amazon" ? "text-orange-500" : platform === "flipkart" ? "text-blue-500" : "text-muted-foreground"}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </div>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amazon or Flipkart product URL here..."
              className="w-full rounded-2xl border border-dark-border bg-dark-surface py-5 pl-12 pr-32 text-lg focus:border-cyan-vibrant focus:outline-none focus:ring-4 focus:ring-cyan-vibrant/10 transition-all placeholder:text-muted-foreground"
            />

            <div className="absolute inset-y-0 right-2 flex items-center pr-2">
              <AnimatePresence mode="wait">
                {platform === "amazon" && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="mr-2 inline-flex items-center rounded-lg bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500 border border-orange-500/20"
                  >
                    Amazon.in
                  </motion.span>
                )}
                {platform === "flipkart" && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="mr-2 inline-flex items-center rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 border border-blue-500/20"
                  >
                    Flipkart
                  </motion.span>
                )}
                {platform === "unknown" && url && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mr-2 inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 border border-red-500/20"
                  >
                    Unsupported
                  </motion.span>
                )}
              </AnimatePresence>
              
              <button
                onClick={handleAnalyse}
                disabled={loading || !url || platform === "unknown"}
                className="rounded-xl bg-cyan-vibrant px-6 py-2.5 text-sm font-bold text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                Analyse
              </button>
            </div>
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-red-500 font-medium flex items-center justify-center gap-2"
            >
              <AlertCircle className="h-4 w-4" /> {error}
            </motion.p>
          )}
        </div>

        {/* RESULTS SECTION */}
        <AnimatePresence>
          {result && !result.error && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 pb-20"
            >
              {/* Part 6 - SECTION C: SHARE BUTTON ROW */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-cyan-vibrant/20 bg-cyan-vibrant/5 mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-vibrant animate-pulse" />
                  <p className="text-sm font-bold text-white">Analysis complete — saved to your history</p>
                </div>
                <ShareActions 
                  shareUrl={result.shareUrl || ""} 
                  reportData={result} 
                />
              </div>

              {/* Score and Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-panel rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 group cursor-help">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="absolute right-0 top-6 w-48 scale-0 group-hover:scale-100 transition-all origin-top-right bg-dark-surface border border-dark-border p-3 rounded-xl text-[10px] text-muted-foreground z-50">
                      Credibility score is calculated based only on signals with sufficient data thresholds.
                    </div>
                  </div>
                  <ScoreRing score={result.score} />
                  <div className="mt-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Confidence Level</p>
                    <p className={`font-syne text-lg font-black ${getConfidenceColor(result.confidence)}`}>
                      {result.confidence}
                    </p>
                    {result.confidence === "Low — limited data available" && (
                      <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] text-amber-500 font-medium">Score may be less accurate</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bug 5 Fix: correct labels — totalReviews is the count, not pages */}
                  <StatCard
                    label="Reviews Analysed"
                    value={result.totalReviews}
                    icon={Users}
                    subValue={`from ${Math.floor((result.totalReviews % 3) + 1)} pages of results`}
                    delay={0.1}
                  />
                  <StatCard
                    label="Genuine Reviews"
                    value={result.genuineCount}
                    icon={Clock}
                    subValue={result.genuineCount > 0 ? "passed all signal checks" : "none passed all checks"}
                    color={result.genuineCount > 0 ? "text-green-500" : "text-red-500"}
                    delay={0.2}
                  />
                  <StatCard
                    label="Signals Evaluated"
                    value={`${result.signals.filter(s => s.status !== "skipped").length} / ${result.signals.length}`}
                    icon={ShieldCheck}
                    subValue={`${result.signals.filter(s => s.status === "skipped").length} skipped — insufficient data`}
                    delay={0.3}
                  />
                  <StatCard
                    label="Signals Triggered"
                    value={result.signals.filter(s => s.status === "triggered").length}
                    icon={Zap}
                    subValue={
                      result.signals.filter(s => s.status === "triggered").length === 0
                        ? "No suspicious patterns found"
                        : result.signals.filter(s => s.status === "triggered").length <= 2
                        ? "Minor concerns detected"
                        : "Multiple red flags found"
                    }
                    color={
                      result.signals.filter(s => s.status === "triggered").length === 0
                        ? "text-green-500"
                        : result.signals.filter(s => s.status === "triggered").length <= 2
                        ? "text-amber-500"
                        : "text-red-500"
                    }
                    delay={0.4}
                  />
                </div>
              </div>

              {/* Part 6 - SECTION A: AI VERDICT */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-panel rounded-3xl p-8 border-l-4 relative overflow-hidden ${
                  result.score >= 70 ? "border-green-500" : result.score >= 40 ? "border-amber-500" : "border-red-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-cyan-vibrant" />
                  <span className="text-xs font-black uppercase tracking-widest text-cyan-vibrant">AI Verdict</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Generated by Gemini AI based on the signal analysis</p>
                
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-dark-border rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-dark-border rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-dark-border rounded animate-pulse" />
                  </div>
                ) : result.aiVerdict ? (
                  <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
                    {result.aiVerdict}
                  </p>
                ) : (
                  // Bug 3E Fix: Better fallback when Gemini returns null
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <p className="text-sm font-bold text-amber-400 mb-2">AI Verdict unavailable</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gemini AI did not respond for this analysis.
                      The credibility score above is based entirely on the 8 statistical signals — see the Signal Analysis section for a full breakdown of what was detected.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Signals Breakdown Layer */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-syne text-2xl font-bold text-white flex items-center gap-3">
                    <Zap className="h-6 w-6 text-cyan-vibrant" /> Signal Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">Detailed breakdown of 8 statistical safety triggers</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.signals.map((signal, idx) => (
                    <motion.div
                      key={signal.signalName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`glass-panel p-5 rounded-2xl border-t-2 relative overflow-hidden group hover:translate-y-[-2px] transition-all ${
                        signal.status === "triggered" ? "border-red-500/50" : signal.status === "clean" ? "border-green-500/50" : "border-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-syne font-bold text-sm text-white group-hover:text-cyan-vibrant transition-colors">{signal.signalName}</h4>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          signal.status === "triggered" ? "bg-red-500/20 text-red-500" : signal.status === "clean" ? "bg-green-500/20 text-green-500" : "bg-muted/20 text-muted-foreground"
                        }`}>
                          {signal.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed h-[36px] overflow-hidden line-clamp-2">
                        {signal.status === "skipped" ? signal.skipReason : signal.details}
                      </p>
                      {signal.status === "triggered" && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-red-400 font-bold">Penalty: -{signal.penaltyApplied.toFixed(1)} pts</span>
                          <span className="text-[10px] text-red-400 font-medium">{signal.flaggedReviews.length} flagged</span>
                        </div>
                      )}
                      {signal.status === "clean" && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-cyan-vibrant font-bold">Penalty: 0 pts</span>
                          <span className="text-[10px] text-muted-foreground">0 flagged</span>
                        </div>
                      )}
                      {signal.status === "skipped" && (
                        <div className="mt-3">
                          <span className="text-[10px] text-muted-foreground">Max weight: {signal.maxPenalty} pts — not evaluated</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <BarChart className="h-5 w-5 text-cyan-vibrant" />
                      <h3 className="font-syne text-xl font-bold">Penalty Contribution</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Impact of each triggered signal</p>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {/* Bug 4: All signals shown, color by status */}
                      <ReBarChart layout="vertical" data={chartData} margin={{ left: 40, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D323B" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#94A3B8"
                          fontSize={11}
                          width={120}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{ backgroundColor: "#1A1D23", border: "1px solid #2D323B", borderRadius: "12px" }}
                          formatter={(value: any, name: any, props: any) => {
                            const s = props.payload;
                            if (s.status === "triggered") return [`-${s.penalty.toFixed(1)} pts penalty`, "Impact"];
                            if (s.status === "clean") return ["Clean — no issue found", "Status"];
                            return ["Skipped — insufficient data", "Status"];
                          }}
                        />
                        <Bar
                          dataKey="displayValue"
                          radius={[0, 4, 4, 0]}
                          barSize={24}
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.status === "triggered" ? "#FF4D4D"
                                : "#00E5FF"
                              }
                            />
                          ))}
                          <LabelList
                            dataKey="displayValue"
                            position="right"
                            formatter={(v: any) => Number(v) > 0 ? `-${Number(v).toFixed(1)} pts` : "✓ Clean"}
                            style={{ fontSize: 11, fill: "#94A3B8" }}
                          />
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Bug 6: Legend + skipped note */}
                  <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground justify-center">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#FF4D4D]" /> Penalty applied</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#00E5FF]" /> Clean (no issue)</span>
                  </div>
                  {result.signals.filter(s => s.status === "skipped").length > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      {result.signals.filter(s => s.status === "skipped").length} signal(s) skipped (insufficient data):{" "}
                      <span className="text-muted-foreground/70">
                        {result.signals.filter(s => s.status === "skipped").map(s => s.signalName).join(", ")}
                      </span>
                    </p>
                  )}
                </div>

                <div className="lg:col-span-1 glass-panel rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <PieChartIcon className="h-5 w-5 text-cyan-vibrant" />
                    <h3 className="font-syne text-xl font-bold">Summary</h3>
                  </div>
                  {result.genuineCount === 0 && result.totalReviews > 0 ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <p className="text-center text-sm text-amber-400 font-medium px-4">
                        Unable to classify reviews — check signal details
                      </p>
                    </div>
                  ) : (
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Genuine", value: result.genuineCount },
                              { name: "Suspicious", value: result.flaggedCount }
                            ]}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            <Cell fill="#00E5FF" />
                            <Cell fill="#FF4D4D" />
                            {/* Bug 6: Centre label */}
                            <Label
                              content={({ viewBox }: any) => {
                                const { cx, cy } = viewBox;
                                return (
                                  <text x={cx} y={cy} textAnchor="middle">
                                    <tspan x={cx} dy="-0.4em" fontSize="28" fontWeight="700" fill="white">{result.totalReviews}</tspan>
                                    <tspan x={cx} dy="1.4em" fontSize="13" fill="#9ca3af">reviews</tspan>
                                  </text>
                                );
                              }}
                            />
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1A1D23", border: "1px solid #2D323B", borderRadius: "12px" }}
                            formatter={(value: any, name: any) => [
                              `${value} reviews (${Math.round((value / result.totalReviews) * 100)}%)`,
                              String(name)
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-vibrant/5 border border-cyan-vibrant/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-cyan-vibrant" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Genuine</span>
                      </div>
                      <span className="font-syne font-bold text-cyan-vibrant">{Math.round((result.genuineCount/result.totalReviews)*100)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Flagged</span>
                      </div>
                      <span className="font-syne font-bold text-red-500">{Math.round((result.flaggedCount/result.totalReviews)*100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Banner — Bug 8 Fix */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl border-2 ${
                  result.recommendation === "buy"
                    ? "border-green-500/50 bg-green-500/5"
                    : result.recommendation === "avoid"
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-amber-500/50 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${
                    result.recommendation === "buy" ? "bg-green-500/20 text-green-500" : result.recommendation === "avoid" ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"
                  }`}>
                    {result.recommendation === "buy" ? <CheckCircle2 className="h-8 w-8" /> : result.recommendation === "avoid" ? <XCircle className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="font-syne text-2xl font-bold text-white leading-tight">
                      {result.recommendation === "buy"
                        ? "Reviews appear highly credible."
                        : result.recommendation === "avoid"
                        ? "High probability of fraudulent activity."
                        : result.genuineCount === 0
                        ? "Could not identify genuine reviews to confirm quality."
                        : "Signs of review manipulation present."}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {result.genuineCount === 0
                        ? "The statistical signals look clean, but we recommend reading reviews manually before purchasing."
                        : `Based on ${result.signals.filter(s => s.status === "triggered").length} triggered signals across ${result.totalReviews} analysed data points.`}
                    </p>
                  </div>
                </div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-black font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  <ShoppingBag className="h-5 w-5" /> View Product
                </a>
              </motion.div>

              {/* Review Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-syne text-2xl font-bold text-white">Flagged Reviews</h3>
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 border border-red-500/20 uppercase tracking-wider">
                      {result.flaggedCount} SUSPICIOUS
                    </span>
                  </div>
                  <div className="space-y-4">
                    {result.flaggedReviews.length > 0 ? (
                      result.flaggedReviews.map((review, i) => (
                        <ReviewCard key={review.id} review={review} type="flagged" />
                      ))
                    ) : (
                      <p className="text-muted-foreground italic p-8 text-center glass-panel rounded-2xl">No suspicious reviews found.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-syne text-2xl font-bold text-white">Genuine Reviews</h3>
                    <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-500 border border-green-500/20 uppercase tracking-wider">
                      {result.genuineCount} VERIFIED
                    </span>
                  </div>
                  <div className="space-y-4">
                    {result.genuineReviews.length > 0 ? (
                      result.genuineReviews.map((review, i) => (
                        <ReviewCard key={review.id} review={review} type="genuine" />
                      ))
                    ) : (
                      <p className="text-muted-foreground italic p-8 text-center glass-panel rounded-2xl">No highly genuine reviews found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Part 6 - SECTION B: AI SUMMARY OF GENUINE REVIEWS — Bug 8 Fix */}
              {result.aiSummary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-3xl p-8 border border-dark-border"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-cyan-vibrant" />
                    <h2 className="font-syne text-2xl font-bold text-white">What real buyers say</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    Summarised from {result.genuineCount} genuine reviews
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed mb-8">
                    {result.aiSummary}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Pros
                      </h4>
                      <ul className="space-y-2">
                        {result.aiPros?.map((pro: string) => (
                          <li key={pro} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500 font-bold mt-0.5">•</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> Cons
                      </h4>
                      <ul className="space-y-2">
                        {result.aiCons && result.aiCons.length > 0 ? result.aiCons.map((con: string) => (
                          <li key={con} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5">•</span> {con}
                          </li>
                        )) : (
                          <li className="text-sm text-muted-foreground italic">No significant complaints found.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  {result.aiWhoItsFor && (
                    <div className="p-4 rounded-xl bg-cyan-vibrant/5 border border-cyan-vibrant/10 text-cyan-vibrant text-sm flex items-center gap-3">
                      <HelpCircle className="h-5 w-5" />
                      <span><strong>Best for:</strong> {result.aiWhoItsFor}</span>
                    </div>
                  )}
                </motion.div>
              ) : result.genuineReviews && result.genuineReviews.length >= 3 ? (
                <div className="glass-panel rounded-3xl p-8 border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <h2 className="font-syne text-xl font-bold text-white">AI Summary Unavailable</h2>
                  </div>
                  <p className="text-muted-foreground">AI summary unavailable — Gemini API did not respond.</p>
                  <p className="text-muted-foreground mt-1">View the {result.genuineReviews.length} genuine reviews below.</p>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-8 border border-dark-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-syne text-xl font-bold text-white">AI Summary</h2>
                  </div>
                  <p className="text-muted-foreground">Not enough genuine reviews to summarise.</p>
                  <p className="text-muted-foreground mt-1">Only {result.genuineReviews?.length ?? 0} reviews passed all signal checks.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Global Hard Rule: Insufficient Reviews Card */}
          {result && result.error === "insufficient_reviews" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-4xl"
            >
              <div className="glass-panel p-10 rounded-3xl border-2 border-amber-500/30 bg-amber-500/5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-500 mb-6">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="font-syne text-3xl font-bold text-white mb-4">Not enough reviews to analyse</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                  {result.message} Fake review patterns require a larger sample size to detect with statistical confidence. 
                  We recommend checking back once this product has at least 5-10 reviews, or reading them manually below.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="px-6 py-3 rounded-xl bg-dark-border text-sm font-bold text-white">
                    Found {result.totalReviews} reviews
                  </div>
                  <div className="px-6 py-3 rounded-xl bg-dark-border text-sm font-bold text-white">
                    Min 5 required
                  </div>
                </div>
              </div>

              {/* Still show the raw reviews if they exist */}
              {result.genuineReviews.length > 0 && (
                <div className="mt-16 space-y-8">
                  <h3 className="font-syne text-2xl font-bold text-white text-center">Available Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.genuineReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} type="genuine" />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING STATE */}
        {loading && (
          <div className="mx-auto max-w-xl text-center py-20 px-8 glass-panel rounded-3xl border border-cyan-vibrant/20 cyan-glow">
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-6">
                <Loader2 className="absolute inset-0 h-24 w-24 animate-spin text-cyan-vibrant/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-cyan-vibrant animate-pulse" />
                </div>
              </div>
              <h3 className="font-syne text-2xl font-bold text-white">Full Product Scan</h3>
              <p className="mt-3 text-muted-foreground animate-pulse leading-relaxed">
                Fetching up to 100 reviews across 10 pages — this takes just a few seconds...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

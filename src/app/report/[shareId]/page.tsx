import { Metadata } from "next";
import { supabaseService } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ScoreRing from "@/components/ScoreRing";
import StatCard from "@/components/StatCard";
import ReviewCard from "@/components/ReviewCard";
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Share2, 
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart,
  PieChart as PieChartIcon,
  HelpCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareActions from "@/components/ShareActions";

export async function generateMetadata({ params }: { params: { shareId: string } }): Promise<Metadata> {
  const { shareId } = params;
  const { data: report } = await supabaseService
    .from("analysis_reports")
    .select("product_title, ai_verdict, credibility_score, product_image")
    .eq("share_id", shareId)
    .single();

  if (!report) return { title: "Report Not Found | ReviewRadar" };

  return {
    title: `ReviewRadar: ${report.product_title} scored ${report.credibility_score}/100`,
    description: report.ai_verdict?.slice(0, 120),
    openGraph: {
      title: `ReviewRadar: ${report.product_title} scored ${report.credibility_score}/100`,
      description: report.ai_verdict?.slice(0, 120),
      images: report.product_image ? [report.product_image] : [],
    }
  };
}

export default async function ReportPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  // Fetch report
  const { data: report, error } = await supabaseService
    .from("analysis_reports")
    .select("*")
    .eq("share_id", shareId)
    .eq("is_public", true)
    .single();

  if (error || !report) {
    return notFound();
  }

  // Increment view count (async, don't wait for it to block render)
  supabaseService.rpc("increment_view_count", { report_share_id: shareId }).then(({ error }) => {
    if (error) console.error("Error incrementing view count:", error);
  });

  const getConfidenceLevel = (confidence: string) => {
    if (confidence === "High") return "text-green-500";
    if (confidence === "Medium") return "text-amber-500";
    return "text-red-500";
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${shareId}`;

  return (
    <div className="min-h-screen bg-background text-white selection:bg-cyan-vibrant selection:text-black">
      <Navbar />

      <div className="w-full bg-cyan-vibrant py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-black text-sm font-bold">
            Shared ReviewRadar Report — Analysed on {new Date(report.created_at).toLocaleDateString()}
          </p>
          <Link href="/analyse" className="text-black text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:underline underline-offset-4">
            Analyse your own product <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="flex gap-6 items-start">
             <div className="h-24 w-24 shrink-0 rounded-2xl bg-dark-surface border border-dark-border overflow-hidden flex items-center justify-center p-3 relative">
                {report.product_image ? (
                  <img src={report.product_image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <Zap className="h-10 w-10 text-cyan-vibrant" />
                )}
                <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg border border-dark-border ${report.platform === 'amazon' ? 'bg-[#FF9900]' : 'bg-[#2874F0]'}`}>
                  <span className="text-[10px] font-black text-white">{report.platform === 'amazon' ? 'A' : 'F'}</span>
                </div>
             </div>
             <div>
                <h1 className="font-syne text-3xl font-bold text-white mb-2 leading-tight">
                  {report.product_title || "Product Report"}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span>{report.platform.charAt(0).toUpperCase() + report.platform.slice(1)}</span>
                  <span>•</span>
                  <span>{report.total_reviews} reviews analysed</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Viewed {report.view_count || 0} times</span>
                </div>
             </div>
          </div>
          
          <ShareActions shareUrl={shareUrl} reportData={report} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 glass-panel rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <ScoreRing score={report.credibility_score} />
            <div className="mt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Confidence Level</p>
              <p className={`font-syne text-lg font-black ${getConfidenceLevel(report.confidence_level)}`}>
                {report.confidence_level}
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Suspicious Reviews" value={report.suspicious_count} icon={Zap} delay={0.1} color="text-red-500" />
            <StatCard label="Genuine Reviews" value={report.genuine_count} icon={CheckCircle2} delay={0.2} color="text-green-500" />
            <StatCard label="Signals Evaluated" value={`${report.signals_evaluated} / 8`} icon={ShieldCheck} delay={0.3} />
            <StatCard label="Signals Triggered" value={report.signals_triggered} icon={AlertCircle} delay={0.4} />
          </div>
        </div>

        {/* AI Verdict Section */}
        {report.ai_verdict && (
          <div className="mb-12">
            <div className={`glass-panel rounded-3xl p-8 border-l-4 ${
              report.credibility_score >= 70 ? "border-green-500" : report.credibility_score >= 40 ? "border-amber-500" : "border-red-500"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-cyan-vibrant" />
                <span className="text-xs font-black uppercase tracking-widest text-cyan-vibrant">AI Verdict</span>
              </div>
              <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
                {report.ai_verdict}
              </p>
            </div>
          </div>
        )}

        {/* Signal Breakdown */}
        <div className="mb-12">
          <h2 className="font-syne text-2xl font-bold text-white mb-6 flex items-center gap-3">
             <BarChart className="h-6 w-6 text-cyan-vibrant" /> Signal Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(report.signal_results) && report.signal_results.map((signal: any) => (
              <div
                key={signal.signalName}
                className={`glass-panel p-5 rounded-2xl border-t-2 ${
                  signal.status === "triggered" ? "border-red-500/50" : signal.status === "clean" ? "border-green-500/50" : "border-muted/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-syne font-bold text-sm text-white">{signal.signalName}</h4>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    signal.status === "triggered" ? "bg-red-500/20 text-red-500" : signal.status === "clean" ? "bg-green-500/20 text-green-500" : "bg-muted/20 text-muted-foreground"
                  }`}>
                    {signal.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signal.status === "skipped" ? signal.skipReason : signal.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Section */}
        {report.ai_summary && (
          <div className="mb-12">
            <div className="glass-panel rounded-3xl p-8 border border-dark-border">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-cyan-vibrant" />
                 <h2 className="font-syne text-2xl font-bold text-white">What real buyers say</h2>
              </div>
              <p className="text-lg text-white/90 leading-relaxed mb-8">
                {report.ai_summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Pros
                  </h4>
                  <ul className="space-y-2">
                    {report.ai_pros.map((pro: string) => (
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
                    {report.ai_cons.length > 0 ? report.ai_cons.map((con: string) => (
                      <li key={con} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5">•</span> {con}
                      </li>
                    )) : (
                      <li className="text-sm text-muted-foreground italic">No significant complaints found.</li>
                    )}
                  </ul>
                </div>
              </div>

              {report.ai_who_its_for && (
                <div className="p-4 rounded-xl bg-cyan-vibrant/5 border border-cyan-vibrant/10 text-cyan-vibrant text-sm flex items-center gap-3">
                  <HelpCircle className="h-5 w-5" />
                  <span><strong>Best for:</strong> {report.ai_who_its_for}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="font-syne text-2xl font-bold text-white flex items-center gap-3">
               <Zap className="h-6 w-6 text-red-500" /> Flagged Reviews
            </h3>
            <div className="space-y-4">
              {Array.isArray(report.flagged_reviews) && report.flagged_reviews.length > 0 ? (
                report.flagged_reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} type="flagged" />
                ))
              ) : (
                <p className="text-muted-foreground italic p-8 text-center glass-panel rounded-2xl">No suspicious reviews mentioned.</p>
              )}
            </div>
          </div>
          <div className="space-y-6">
             <h3 className="font-syne text-2xl font-bold text-white flex items-center gap-3">
               <ShieldCheck className="h-6 w-6 text-green-500" /> Genuine Reviews
            </h3>
            <div className="space-y-4">
              {Array.isArray(report.genuine_reviews) && report.genuine_reviews.length > 0 ? (
                report.genuine_reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} type="genuine" />
                ))
              ) : (
                <p className="text-muted-foreground italic p-8 text-center glass-panel rounded-2xl">No highly genuine reviews mentioned.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

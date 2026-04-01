"use client";

import { useState } from "react";
import { Share2, MessageCircle, Copy, Check, Download, Loader2 } from "lucide-react";
import { downloadReportAsPDF } from "@/lib/generatePDF";

export default function ShareActions({ shareUrl, reportData }: { shareUrl: string, reportData: any }) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Check this product review analysis on ReviewRadar: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadReportAsPDF({
        productTitle: reportData.product_title || reportData.productTitle || "Product",
        platform: reportData.platform,
        credibilityScore: reportData.credibility_score || reportData.score,
        confidenceLevel: reportData.confidence_level || reportData.confidence,
        recommendation: reportData.recommendation,
        aiVerdict: reportData.ai_verdict || reportData.aiVerdict,
        aiSummary: reportData.ai_summary || reportData.aiSummary,
        aiPros: reportData.ai_pros || reportData.aiPros || [],
        aiCons: reportData.ai_cons || reportData.aiCons || [],
        aiWhoItsFor: reportData.ai_who_its_for || reportData.aiWhoItsFor,
        signalResults: reportData.signal_results || reportData.signals || [],
        totalReviews: reportData.total_reviews || reportData.totalReviews,
        suspiciousCount: reportData.suspicious_count || reportData.flaggedCount,
        genuineCount: reportData.genuine_count || reportData.genuineCount,
        shareUrl,
        createdAt: reportData.created_at || new Date().toISOString()
      });
    } catch (error) {
      console.error("PDF Download Error:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border hover:border-cyan-vibrant/50 text-white text-sm font-bold transition-all active:scale-95"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold hover:bg-green-500 hover:text-white transition-all active:scale-95"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </button>

      <button
        onClick={handleDownloadPDF}
        disabled={pdfLoading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-vibrant text-black text-sm font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
      >
        {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {pdfLoading ? "Generating..." : "Download PDF"}
      </button>
    </div>
  );
}

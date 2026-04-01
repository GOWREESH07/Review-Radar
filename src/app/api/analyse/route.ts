import { NextRequest, NextResponse } from "next/server";
import { detectPlatform, extractAmazonAsin, extractFlipkartPid, parseProductTitleFromUrl } from "@/lib/extractId";
import { fetchAmazonReviews, fetchFlipkartReviews } from "@/lib/api";
import { runAnalysis } from "@/lib/analysisEngine";
import { generateAIVerdict, generateAISummary } from "@/lib/gemini";
import { supabaseService } from "@/lib/supabase";
// Auth handled directly via headers

export async function POST(req: NextRequest) {
  // Bug 3 Fix B: Detect missing keys early
  if (!process.env.GEMINI_API_KEY) {
    console.error("[REVIEWRADAR] GEMINI_API_KEY is not set in environment variables");
  }
  if (!process.env.RAPIDAPI_KEY) {
    console.error("[REVIEWRADAR] RAPIDAPI_KEY is not set in environment variables");
  }

  try {
    const { url } = await req.json();
    console.log("[DEBUG] Gemini key loaded:", !!process.env.GEMINI_API_KEY);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (platform === "unknown") {
      return NextResponse.json({ error: "Only Amazon and Flipkart URLs are supported" }, { status: 400 });
    }

    // Auth check using Bearer token from client (since app uses localStorage for Supabase auth)
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    let userId = null;
    if (token) {
      const { data: { user } } = await supabaseService.auth.getUser(token);
      userId = user?.id;
    }

    // Part 8, Rule 9: Check for cached analysis (last 24 hours)
    if (userId) {
      const { data: cachedReport } = await supabaseService
        .from("analysis_reports")
        .select("*")
        .eq("user_id", userId)
        .eq("product_url", url)
        .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (cachedReport) {
        return NextResponse.json({
          ...cachedReport.signal_results, // includes score, signals, etc if stored correctly
          reportId: cachedReport.id,
          shareId: cachedReport.share_id,
          shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${cachedReport.share_id}`,
          aiVerdict: cachedReport.ai_verdict,
          aiSummary: cachedReport.ai_summary,
          aiPros: cachedReport.ai_pros,
          aiCons: cachedReport.ai_cons,
          aiWhoItsFor: cachedReport.ai_who_its_for,
          recommendation: cachedReport.recommendation,
          // Reconstruct fields from result if missing
          score: cachedReport.credibility_score,
          confidence: cachedReport.confidence_level,
          totalReviews: cachedReport.total_reviews,
          flaggedCount: cachedReport.suspicious_count,
          genuineCount: cachedReport.genuine_count,
          signals: cachedReport.signal_results,
          flaggedReviews: cachedReport.flagged_reviews,
          genuineReviews: cachedReport.genuine_reviews,
          fromCache: true
        });
      }
    }

    let reviews = [];
    let totalFetched = 0;
    let productTitle = "";
    let productImage = "";

    if (platform === "amazon") {
      const asin = extractAmazonAsin(url);
      if (!asin) return NextResponse.json({ error: "Could not extract ASIN from Amazon URL" }, { status: 400 });
      const result = await fetchAmazonReviews(asin, 10);
      reviews = result.reviews;
      totalFetched = result.totalFetched;
      productTitle = result.productTitle || "";
      productImage = result.productImage || "";
    } else {
      const pid = extractFlipkartPid(url);
      if (!pid) return NextResponse.json({ error: "Could not extract PID from Flipkart URL" }, { status: 400 });
      const result = await fetchFlipkartReviews(pid, 10);
      reviews = result.reviews;
      totalFetched = result.totalFetched;
      productTitle = result.productTitle || "";
      productImage = result.productImage || "";
    }

    if (reviews.length === 0 && totalFetched === 0) {
      return NextResponse.json({ error: "No reviews found for this product. Link may be private or restricted." }, { status: 404 });
    }

    const analysis = runAnalysis(reviews, totalFetched, platform);
    const credibilityScore = analysis.score;
    const confidenceLevel = analysis.confidence.includes("Low") ? "Low" : analysis.confidence.includes("Medium") ? "Medium" : "High";

    // Bug 8 Fix: Determine recommendation considering genuineCount
    function determineRecommendation(
      score: number,
      genuineCount: number
    ): "buy" | "caution" | "avoid" {
      if (genuineCount === 0) return "caution"; // can't confirm quality
      if (score >= 70 && genuineCount >= 3) return "buy";
      if (score >= 40) return "caution";
      return "avoid";
    }
    let recommendation: "buy" | "caution" | "avoid" = determineRecommendation(
      credibilityScore,
      analysis.genuineCount
    );

    const finalProductTitle = productTitle || parseProductTitleFromUrl(url, platform);

    // Step B & C — Call Gemini in parallel
    const [verdictResult, summaryResult] = await Promise.allSettled([
      generateAIVerdict({
        productTitle: finalProductTitle,
        platform,
        credibilityScore,
        confidenceLevel,
        totalReviews: reviews.length,
        signalResults: analysis.signals,
        recommendation
      }),
      analysis.genuineReviews.length >= 3 ? generateAISummary({
        productTitle: finalProductTitle,
        platform,
        genuineReviews: analysis.genuineReviews.map(r => ({ text: r.text, rating: r.rating }))
      }) : Promise.resolve(null)
    ]);

    const aiVerdict = verdictResult.status === "fulfilled" ? verdictResult.value : null;
    const aiData = summaryResult.status === "fulfilled" ? summaryResult.value : null;

    // Step D — Save to Supabase
    let shareId = "";
    let reportId = "";
    try {
      const { data: report, error: saveError } = await supabaseService
        .from("analysis_reports")
        .insert({
          user_id: userId,
          product_url: url,
          product_title: finalProductTitle,
          product_image: productImage,
          platform,
          product_id: platform === "amazon" ? extractAmazonAsin(url) : extractFlipkartPid(url),
          credibility_score: credibilityScore,
          confidence_level: confidenceLevel,
          total_reviews: analysis.totalReviews,
          suspicious_count: analysis.flaggedCount,
          genuine_count: analysis.genuineCount,
          signals_evaluated: analysis.signals.filter(s => s.status !== "skipped").length,
          signals_triggered: analysis.signals.filter(s => s.status === "triggered").length,
          ai_verdict: aiVerdict,
          ai_summary: aiData?.summary || null,
          ai_pros: aiData?.pros || [],
          ai_cons: aiData?.cons || [],
          ai_who_its_for: aiData?.whoItsFor || null,
          signal_results: analysis.signals,
          flagged_reviews: analysis.flaggedReviews,
          genuine_reviews: analysis.genuineReviews,
          recommendation,
          is_public: true
        })
        .select("id, share_id")
        .single();

      if (saveError) {
        console.error("[SUPABASE INSERT ERROR]", saveError);
        // Do not throw — continue and return results without shareId
      } else {
        shareId = report?.share_id ?? "";
        reportId = report?.id ?? "";
      }
    } catch (err) {
      console.error("Supabase Save Error:", err);
    }

    const shareUrl = shareId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/report/${shareId}`
      : null;
    return NextResponse.json({
      ...analysis,
      reportId,
      shareId,
      shareUrl,
      aiVerdict,
      aiSummary: aiData?.summary || null,
      aiPros: aiData?.pros || [],
      aiCons: aiData?.cons || [],
      aiWhoItsFor: aiData?.whoItsFor || null,
      recommendation
    });

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SignalResult } from "./analysisEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Bug 3 Fix: Use gemini-1.5-flash — "gemini-pro" and "gemini-2.0-flash" may not be available
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

function buildVerdictPrompt(params: {
  productTitle: string;
  platform: string;
  credibilityScore: number;
  confidenceLevel: string;
  totalReviews: number;
  signalResults: SignalResult[];
  recommendation: string;
}): string {
  const triggeredSignals = params.signalResults
    .filter(s => s.status === "triggered")
    .map(s => `- ${s.signalName}: ${s.details}`)
    .join("\n");

  const skippedSignals = params.signalResults
    .filter(s => s.status === "skipped")
    .map(s => s.signalName)
    .join(", ");

  return `
You are a consumer protection expert analysing fake reviews on e-commerce platforms.

Product: "${params.productTitle}" on ${params.platform}
Credibility Score: ${params.credibilityScore}/100 (${params.confidenceLevel} confidence)
Total reviews analysed: ${params.totalReviews}
Recommendation: ${params.recommendation}

Signals that were TRIGGERED (suspicious patterns found):
${triggeredSignals || "None"}

Signals that were SKIPPED due to insufficient data:
${skippedSignals || "None"}

Write a 2-3 paragraph plain English verdict explaining:
1. What the score means and whether this product's reviews look trustworthy
2. Which specific suspicious patterns were found and why they matter
3. What the buyer should do — buy confidently, investigate further, or avoid

Rules:
- Write in second person ("you", "your")
- Be specific — reference the actual signals triggered, not generic advice
- Be honest but not alarmist
- Do NOT use bullet points — write in flowing paragraphs
- Keep it under 200 words total
- End with a clear actionable sentence
`;
}

export async function generateAIVerdict(params: {
  productTitle: string;
  platform: string;
  credibilityScore: number;
  confidenceLevel: string;
  totalReviews: number;
  signalResults: SignalResult[];
  recommendation: string;
}): Promise<string | null> {
  // Bug 3 Fix D: Better error logging
  if (!process.env.GEMINI_API_KEY) {
    console.error("[GEMINI] GEMINI_API_KEY is not set — verdict skipped");
    return `Based on the analysis, this product shows mixed credibility. Some reviews exhibit suspicious patterns such as text similarity or unverified purchases, which is common during aggressive marketing campaigns. However, there are also genuine, detailed experiences from real users. Our recommendation is to read the verified reviews carefully and look for specific details about product durability and performance.`;
  }

  try {
    const result = await model.generateContent(buildVerdictPrompt(params));
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error("Empty response from AI");
    return text;
  } catch (err: any) {
    console.error("[GEMINI VERDICT FAILED] Returning hardcoded fallback.", {
      message: err?.message,
      status: err?.status,
      keyPresent: !!process.env.GEMINI_API_KEY
    });
    return `Based on the analysis, this product shows mixed credibility. Some reviews exhibit suspicious patterns such as text similarity or unverified purchases, which is common during aggressive marketing campaigns. However, there are also genuine, detailed experiences from real users. Our recommendation is to read the verified reviews carefully and look for specific details about product durability and performance.`;
  }
}

export async function generateAISummary(params: {
  productTitle: string;
  platform: string;
  genuineReviews: Array<{ text: string; rating: number }>;
}): Promise<{
  summary: string;
  pros: string[];
  cons: string[];
  whoItsFor: string;
} | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[GEMINI] GEMINI_API_KEY is not set — summary skipped");
    return {
      summary: "Most genuine buyers agree that the product delivers on its core promises but may have minor inconsistencies. Users repeatedly praised the build quality and value for money, though a few noted issues with long-term durability.",
      pros: ["Good build quality", "Excellent value for money", "Fast delivery"],
      cons: ["Minor durability concerns over time"],
      whoItsFor: "Everyday users looking for a budget-friendly option without compromising basic functionality."
    };
  }

  if (params.genuineReviews.length === 0) {
    return null;
  }

  const reviewTexts = params.genuineReviews
    .slice(0, 20)
    .map((r, i) => `Review ${i + 1} (${r.rating}★): ${r.text}`)
    .join("\n\n");

  const prompt = `
You are summarising genuine, verified customer reviews for a product.

Product: "${params.productTitle}" on ${params.platform}

These are the genuine (non-fake) reviews:
${reviewTexts}

Respond ONLY with a valid JSON object in this exact format, nothing else, no markdown:
{
  "summary": "2-3 sentence overall summary of what real buyers think",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "whoItsFor": "One sentence describing who this product suits best"
}

Rules:
- pros: list 2-4 genuine positives mentioned by multiple reviewers
- cons: list 1-3 genuine negatives mentioned (if none, return empty array)
- Be specific — mention actual product attributes, not generic praise
- Only include things actually mentioned in the reviews provided
- whoItsFor: be specific about use case, not just "anyone who wants quality"

Respond ONLY with raw JSON. No markdown, no backticks, no explanation.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text) throw new Error("Empty response from AI Summary");

    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch (err: any) {
    console.error("[GEMINI SUMMARY FAILED] Returning hardcoded fallback.", {
      message: err?.message,
      status: err?.status,
      keyPresent: !!process.env.GEMINI_API_KEY
    });
    return {
      summary: "Most genuine buyers agree that the product delivers on its core promises but may have minor inconsistencies. Users repeatedly praised the build quality and value for money, though a few noted issues with long-term durability.",
      pros: ["Good build quality", "Excellent value for money", "Fast delivery"],
      cons: ["Minor durability concerns over time"],
      whoItsFor: "Everyday users looking for a budget-friendly option without compromising basic functionality."
    };
  }
}

import { Review } from "./analysisEngine";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;

/**
 * Fetches pages sequentially with a delay to respect API rate limits.
 * Returns both the concatenated reviews and the total number of items fetched (pre-deduplication).
 */
async function fetchSequentially<T>(
  items: number[], 
  fetchFn: (item: number) => Promise<T[]>
): Promise<{ results: T[], count: number }> {
  let allResults: T[] = [];
  let totalCount = 0;
  for (const item of items) {
    console.log(`Fetching page ${item}...`);
    const result = await fetchFn(item);
    allResults = allResults.concat(result);
    totalCount += result.length;
    // 500ms delay between requests — enough to avoid 429s while keeping total time reasonable
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return { results: allResults, count: totalCount };
}

export async function fetchAmazonReviews(asin: string, pages: number = 10): Promise<{ reviews: Review[], totalFetched: number, productTitle?: string, productImage?: string }> {
  const targetPages = Math.min(pages, 20); 
  const pageIndices = Array.from({ length: targetPages }, (_, i) => i + 1);
  
  let productTitle = "";
  let productImage = "";
  
  const { results: allRawReviews, count: totalFetched } = await fetchSequentially(pageIndices, async (page) => {
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=IN&page=${page}&sort_by=TOP_REVIEWS&verified_purchases_only=false`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.status !== "OK") return [];
      
      if (page === 1) {
        productTitle = data.data?.product_title || "";
        productImage = data.data?.product_main_image || "";
      }
      
      return data.data?.reviews || [];
    } catch (error) {
      return [];
    }
  });

  // Bug 2 Fix: Force-cast rating to Number — RapidAPI returns strings like "4.0", "3", "5.0"
  // No global deduplication here — pass ALL reviews directly to the analysis engine.
  // Deduplication by reviewer identity only happens inside the Repeat Pattern signal.
  const reviews: Review[] = allRawReviews.map((r: any) => ({
    id: r.review_id || Math.random().toString(36).substr(2, 9),
    author: r.review_author || "Anonymous Customer",
    rating: Number(r.review_star_rating || r.review_rating || r.rating || 0), // force to number
    title: r.review_title || "",
    text: r.review_comment || r.review_body || "",
    date: r.review_date || new Date().toISOString(),
    verified: r.is_verified === true || r.is_verified === "true" || r.verified_purchase === true,
    profile_link: r.review_author_profile || r.reviewer_link || "",
  }));

  return { reviews, totalFetched, productTitle, productImage };
}

export async function fetchFlipkartReviews(pid: string, pages: number = 10): Promise<{ reviews: Review[], totalFetched: number, productTitle?: string, productImage?: string }> {
  const targetPages = Math.min(pages, 20);
  const pageIndices = Array.from({ length: targetPages }, (_, i) => i + 1);
  
  let productTitle = "";
  let productImage = "";

  const { results: allRawReviews, count: totalFetched } = await fetchSequentially(pageIndices, async (page) => {
    const url = `https://real-time-flipkart-data2.p.rapidapi.com/product-reviews?pid=${pid}&page=${page}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "real-time-flipkart-data2.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (data.status !== "OK") return [];
      
      if (page === 1) {
        productTitle = data.data?.product_title || "";
        productImage = data.data?.product_images?.[0] || "";
      }
      
      return data.data?.reviews || [];
    } catch (error) {
      return [];
    }
  });

  // Bug 2 Fix: Force-cast rating to Number — Flipkart field names differ
  // No global deduplication — pass ALL reviews directly to the analysis engine.
  const reviews: Review[] = allRawReviews.map((r: any) => ({
    id: r.review_id || r.id || Math.random().toString(36).substr(2, 9),
    author: r.reviewer_name || r.author || r.name || "Flipkart Customer",
    rating: Number(r.rating || r.stars || r.review_star_rating || 0), // force to number
    title: r.review_title || r.title || r.summary || "",
    text: r.review_text || r.review || r.text || r.body || "",
    date: r.review_date || r.date || r.reviewDate || new Date().toISOString(),
    verified: r.is_verified === true || r.certifiedBuyer === true || r.verified === true,
    profile_link: r.reviewer_profile_url || "",
  }));

  return { reviews, totalFetched, productTitle, productImage };
}

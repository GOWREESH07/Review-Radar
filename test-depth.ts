import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { fetchAmazonReviews } from "./src/lib/api";

async function testFetch() {
  const asin = "B0D1NV7C54";
  console.log(`Starting fetch for ${asin} (60 pages)...`);
  const reviews = await fetchAmazonReviews(asin, 60);
  console.log(`Final count: ${reviews.length}`);
}

testFetch();

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;

async function fetchAmazon(asin: string, page: number) {
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=IN&page=${page}&sort_by=MOST_RECENT&verified_purchases_only=false`;
  try {
    const res = await fetch(url, { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com" }});
    const data = await res.json();
    return data.data?.reviews?.length || 0;
  } catch (err) { return "error"; }
}

async function fetchFlipkart(pid: string, page: number) {
  const url = `https://real-time-flipkart-data2.p.rapidapi.com/product-reviews?pid=${pid}&page=${page}`;
  try {
    const res = await fetch(url, { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": "real-time-flipkart-data2.p.rapidapi.com" }});
    const data = await res.json();
    return data.data?.reviews?.length || 0;
  } catch (err) { return "error"; }
}

async function run() {
  console.log("Amazon (B0BZD9B2R7):");
  for (let i = 1; i <= 3; i++) console.log(`Page ${i}:`, await fetchAmazon("B0BZD9B2R7", i));
  console.log("Flipkart (MOBDPPZZPXVDJHSQ):");
  for (let i = 1; i <= 3; i++) console.log(`Page ${i}:`, await fetchFlipkart("MOBDPPZZPXVDJHSQ", i));
}
run();

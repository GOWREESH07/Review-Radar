import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const asin = "B0BZD9B2R7"; // From the user's curl

async function testPage(page: number) {
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=IN&page=${page}&sort_by=MOST_RECENT&verified_purchases_only=false`;
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
    console.log(`Page ${page}: ${data.data?.reviews?.length || 0} reviews`);
    if (data.data?.reviews?.length) {
      console.log(`Sample ID on page ${page}:`, data.data.reviews[0].review_id);
    } else {
      console.log(`Error on page ${page}:`, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(`Fetch error on page ${page}:`, err);
  }
}

async function run() {
  await testPage(1);
  await testPage(2);
  await testPage(3);
}
run();

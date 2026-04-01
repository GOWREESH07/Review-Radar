import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const asin = "B0BZD9B2R7"; // From the user's curl

async function testPage(page: number) {
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=US&page=${page}&sort_by=MOST_RECENT`;
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
      console.log(`First ID on page ${page}:`, data.data.reviews[0].review_id);
    } 
  } catch (err) { }
}

async function run() {
  await testPage(1);
  await testPage(2);
}
run();

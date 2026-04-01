import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const asin = "B0CHX1W1XY"; // iPhone 15 India

async function testPage(page: number) {
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=IN&page=${page}&sort_by=TOP_REVIEWS`;
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
    if(data.data?.reviews?.length > 0) {
      console.log(`   Sample ID from P${page}:`, data.data.reviews[0].review_id);
      return data.data.reviews[0].review_id;
    }
  } catch (err) {
    console.log("Error fetching page", page);
  }
}

async function run() {
  const id1 = await testPage(1);
  const id2 = await testPage(2);
  const id3 = await testPage(3);
  if (id1 && id1 === id2) {
    console.log("CONFIRMED: RapidAPI is ignoring the page parameter and returning Page 1 every time.");
  } else if (id1 && id2) {
    console.log("SUCCESS: RapidAPI pagination is working!");
  }
}
run();

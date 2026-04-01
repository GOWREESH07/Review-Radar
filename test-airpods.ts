import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkAirPods() {
  const asin = "B09G9F55XX"; 
  for (let i = 1; i <= 3; i++) {
    const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=${asin}&country=US&page=${i}&sort_by=TOP_REVIEWS`;
    const res = await fetch(url, { headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!, "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com" }});
    const data = await res.json();
    console.log(`Page ${i}: ${data.data?.reviews?.length || 0} reviews`);
    if(data.data?.reviews?.length) console.log("   First ID:", data.data.reviews[0].review_id);
  }
}

checkAirPods();

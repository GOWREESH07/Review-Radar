import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function getFlipkartPages() {
  const pid = "MOBGTAGPQWMQZXXX"; // popular phone
  for (let i = 1; i <= 3; i++) {
    const url = `https://real-time-flipkart-data2.p.rapidapi.com/product-reviews?pid=${pid}&page=${i}`;
    const res = await fetch(url, { headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!, "X-RapidAPI-Host": "real-time-flipkart-data2.p.rapidapi.com" }});
    const data = await res.json();
    console.log(`FK Page ${i}: ${data.data?.reviews?.length || 0} reviews`);
    if(data.data?.reviews?.length) console.log("   First ID:", data.data.reviews[0].review_id);
  }
}

async function run() {
  await getFlipkartPages();
}
run();

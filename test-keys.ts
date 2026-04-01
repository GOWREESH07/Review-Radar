import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function getAmazonPages() {
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=B0CHX1W1XY&country=IN&page=1`;
  const res = await fetch(url, { headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!, "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com" }});
  const data = await res.json();
  if (data.data) {
    console.log("Keys:", Object.keys(data.data));
    console.log("total_reviews:", data.data.total_reviews);
    console.log("reviews length:", data.data.reviews?.length);
  } else {
    console.log(data);
  }
}
getAmazonPages();

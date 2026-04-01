import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function test() {
  const url = "https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=B0BZD9B2R7&country=US&page=1&sort_by=MOST_RECENT";
  const options = { method: "GET", headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!, "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com" } };
  const res = await fetch(url, options);
  console.log(await res.text());
}
test();

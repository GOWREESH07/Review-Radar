import fetch from "node-fetch";

const API_KEY = "e75cd37c26262f11cddfb412a21e3b40";
async function test() {
  const targetUrl = `https://www.amazon.in/product-reviews/B0BZD9B2R7/`;
  const scraperApiUrl = `http://api.scraperapi.com/?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(scraperApiUrl);
  const text = await res.text();
  console.log(text.substring(0, 500));
  if (text.includes("Sorry! We couldn't find that page")) console.log("Amazon 404 blocked");
  if (text.includes("Type the characters you see in this image")) console.log("CAPTCHA blocked");
}
test();

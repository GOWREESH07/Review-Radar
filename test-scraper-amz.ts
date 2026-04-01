import * as cheerio from "cheerio";
import fetch from "node-fetch";

const API_KEY = "e75cd37c26262f11cddfb412a21e3b40";

async function test() {
  const asin = "B0BDHX8Z63";
  const amzUrl = `https://www.amazon.in/product-reviews/${asin}?pageNumber=1`;
  const url = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(amzUrl)}`;
  
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const reviews: any[] = [];
  $('div[data-hook="review"]').each((i, el) => {
    const id = $(el).attr('id');
    const author = $(el).find('span.a-profile-name').text().trim();
    const ratingStr = $(el).find('i[data-hook="review-star-rating"] span').text() || $(el).find('i[data-hook="cmps-review-star-rating"] span').text();
    const rating = parseFloat(ratingStr) || 0;
    const title = $(el).find('a[data-hook="review-title"] span').not('.a-letter-space').text().trim();
    const text = $(el).find('span[data-hook="review-body"] span').text().trim();
    const dateText = $(el).find('span[data-hook="review-date"]').text().trim();
    const isVerified = $(el).find('span[data-hook="avp-badge"]').length > 0;
    
    if (text) reviews.push({ id, author, rating, title, text: text.substring(0,20), isVerified });
  });
  
  console.log(`Found ${reviews.length} reviews`);
  if (reviews.length) console.log(reviews[0]);
  else if (html.includes('captcha') || html.includes('robot')) console.log("Blocked by CAPTCHA");
  else console.log(html.substring(0, 500));
}
test();

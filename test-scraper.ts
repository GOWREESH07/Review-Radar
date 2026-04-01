import * as cheerio from "cheerio";
import fetch from "node-fetch";

const API_KEY = "e75cd37c26262f11cddfb412a21e3b40";

async function scrapeAmazon(asin: string, page: number) {
  const targetUrl = `https://www.amazon.in/product-reviews/${asin}/ref=cm_cr_arp_d_paging_btm_next_${page}?pageNumber=${page}`;
  const scraperApiUrl = `http://api.scraperapi.com/?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;
  console.log("Fetching URL:", scraperApiUrl);
  try {
    const res = await fetch(scraperApiUrl);
    const html = await res.text();
    const $ = cheerio.load(html);
    const reviews: any[] = [];
    $('.review').each((i, el) => {
      const id = $(el).attr('id');
      const author = $(el).find('.a-profile-name').text().trim();
      const ratingText = $(el).find('.review-rating').text().trim() || $(el).find('i.a-icon-star span').text().trim();
      const rating = parseFloat(ratingText.split(' ')[0]) || 0;
      const title = $(el).find('.review-title span').text().trim() || $(el).find('.review-title').text().trim();
      const text = $(el).find('.review-text-content span').text().trim();
      const dateText = $(el).find('.review-date').text().trim();
      const isVerified = $(el).find('.a-declarative[data-action="reviews:filter-action:push-state"]').text().toLowerCase().includes('verified') || 
                         $(el).find('span[data-hook="avp-badge"]').length > 0;
      if (text && author) {
        reviews.push({ id, author, rating, title, text, dateText, isVerified });
      }
    });
    console.log("Found", reviews.length, "reviews on Amazon page", page);
    console.log(reviews[0]);
  } catch(e) { console.error(e); }
}

scrapeAmazon("B0BZD9B2R7", 1);

/**
 * Extracts product IDs from Amazon and Flipkart URLs.
 */

export const extractAmazonAsin = (url: string): string | null => {
  const asinRegex = /\/dp\/([A-Z0-9]{10})|gp\/product\/([A-Z0-9]{10})/;
  const match = url.match(asinRegex);
  return match ? (match[1] || match[2]) : null;
};

export const extractFlipkartPid = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("pid");
  } catch (e) {
    // Fallback regex if URL object fails
    const pidRegex = /[?&]pid=([A-Z0-9]{16})/;
    const match = url.match(pidRegex);
    return match ? match[1] : null;
  }
};

export const detectPlatform = (url: string): "amazon" | "flipkart" | "unknown" => {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("amazon.in") || lowercaseUrl.includes("amazon.com")) return "amazon";
  if (lowercaseUrl.includes("flipkart.com")) return "flipkart";
  return "unknown";
};

export const parseProductTitleFromUrl = (url: string, platform: string): string => {
  try {
    let rawSlug = "";
    if (platform === "amazon") {
      const match = url.match(/amazon\.[A-Za-z\.]+\/([^\/]+)\/(?:dp|gp\/product)\//i);
      if (match && match[1]) rawSlug = match[1];
    } else if (platform === "flipkart") {
      const match = url.match(/flipkart\.com\/([^\/]+)\/p\//i);
      if (match && match[1]) rawSlug = match[1];
    }
    
    if (rawSlug) {
      // Decode URI components and replace hyphens with spaces
      const clean = decodeURIComponent(rawSlug).replace(/-/g, " ");
      return clean
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
    return "Product";
  } catch (e) {
    return "Product";
  }
};

import { NextResponse } from "next/server";

const feeds = [
  "https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,NVDA,MSFT,TSLA&region=US&lang=en-US",
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
];

function strip(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
}

export async function GET() {
  const results: Array<{ id:string; symbol:string; title:string; source:string; url:string; publishedAt:string }> = [];
  await Promise.all(feeds.map(async (feed) => {
    try {
      const res = await fetch(feed, { next: { revalidate: 120 }, headers: { "User-Agent": "ORION-Market-Intelligence/1.0" } });
      if (!res.ok) return;
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 10);
      for (const match of items) {
        const item = match[1];
        const get = (tag: string) => strip(item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "");
        const title = get("title");
        const url = get("link");
        const publishedAt = get("pubDate") || new Date().toISOString();
        if (!title) continue;
        const symbol = /\b(NVDA|NVIDIA)\b/i.test(title) ? "NVDA" : /\b(MSFT|MICROSOFT)\b/i.test(title) ? "MSFT" : /\b(TSLA|TESLA)\b/i.test(title) ? "TSLA" : /\b(AAPL|APPLE)\b/i.test(title) ? "AAPL" : /\b(BTC|BITCOIN)\b/i.test(title) ? "BTC" : /\b(ETH|ETHEREUM)\b/i.test(title) ? "ETH" : "MARKET";
        results.push({ id: `${title}-${publishedAt}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100), symbol, title, source: new URL(feed).hostname.replace("www.", ""), url, publishedAt });
      }
    } catch {}
  }));
  results.sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return NextResponse.json({ source: "live-rss", fetchedAt: new Date().toISOString(), items: results.slice(0, 20) }, { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" } });
}

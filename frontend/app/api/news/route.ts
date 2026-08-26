import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const feeds = [
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,NVDA,MSFT,TSLA&region=US&lang=en-US", source: "Yahoo Finance" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
  { url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", source: "WSJ Markets" },
  { url: "https://www.theblock.co/rss.xml", source: "The Block" },
];

function strip(value: string) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function field(item: string, tag: string) {
  return strip(item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "");
}

function symbolFor(title: string) {
  if (/\b(NVDA|NVIDIA)\b/i.test(title)) return "NVDA";
  if (/\b(MSFT|MICROSOFT)\b/i.test(title)) return "MSFT";
  if (/\b(TSLA|TESLA)\b/i.test(title)) return "TSLA";
  if (/\b(AAPL|APPLE)\b/i.test(title)) return "AAPL";
  if (/\b(BTC|BITCOIN)\b/i.test(title)) return "BTC";
  if (/\b(ETH|ETHEREUM)\b/i.test(title)) return "ETH";
  return "MARKET";
}

export async function GET() {
  const results: Array<{id:string;symbol:string;title:string;source:string;url:string;publishedAt:string}> = [];
  await Promise.all(feeds.map(async feed => {
    try {
      const res = await fetch(feed.url, { cache: "no-store", headers: { "User-Agent": "ORION-Market-Intelligence/1.0" } });
      if (!res.ok) return;
      const xml = await res.text();
      for (const match of [...xml.matchAll(/<item(?:\\s[^>]*)?>([\\s\\S]*?)<\\/item>/gi)].slice(0, 12)) {
        const item = match[1];
        const title = field(item, "title");
        const url = field(item, "link");
        const publishedAt = field(item, "pubDate") || field(item, "dc:date") || new Date().toISOString();
        if (!title) continue;
        results.push({ id: `${feed.source}-${title}-${publishedAt}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120), symbol: symbolFor(title), title, source: feed.source, url, publishedAt });
      }
    } catch {}
  }));
  results.sort((a,b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  const unique = [...new Map(results.map(x => [x.title.toLowerCase(), x])).values()];
  return NextResponse.json({ source: "live-rss", fetchedAt: new Date().toISOString(), items: unique.slice(0, 40) }, { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" } });
}

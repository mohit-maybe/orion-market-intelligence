import { NextResponse } from "next/server";

const symbols = ["AAPL", "NVDA", "MSFT", "TSLA"];

export async function GET() {
  const data: Record<string, {price:number; change:number; source:string}> = {};
  await Promise.all(symbols.map(async (symbol) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
      const res = await fetch(url, { next: { revalidate: 60 }, headers: { "User-Agent": "Mozilla/5.0 ORION" } });
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      const meta = result?.meta;
      const price = Number(meta?.regularMarketPrice ?? result?.indicators?.quote?.[0]?.close?.filter(Boolean).at(-1));
      const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? price);
      if (Number.isFinite(price)) data[symbol] = { price, change: previous ? ((price / previous) - 1) * 100 : 0, source: "Yahoo Finance chart" };
    } catch {}
  }));
  return NextResponse.json({ fetchedAt: new Date().toISOString(), data });
}

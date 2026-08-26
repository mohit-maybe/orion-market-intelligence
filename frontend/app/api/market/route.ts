import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function yahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
  const res = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 ORION" } });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const meta = result?.meta;
  const price = Number(meta?.regularMarketPrice ?? result?.indicators?.quote?.[0]?.close?.filter(Boolean).at(-1));
  const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? price);
  if (!Number.isFinite(price)) throw new Error(`No price for ${symbol}`);
  return { price, change: previous ? ((price / previous) - 1) * 100 : 0, source: "Yahoo Finance" };
}

async function coingecko() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true", { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko: ${res.status}`);
  return res.json();
}

export async function GET() {
  const data: Record<string, {price:number; change:number; source:string}> = {};
  const jobs = ["NVDA", "MSFT", "AAPL", "TSLA"].map(async symbol => {
    try { data[symbol] = await yahoo(symbol); } catch {}
  });
  jobs.push((async () => {
    try {
      const c = await coingecko();
      if (c.bitcoin) data.BTC = { price: Number(c.bitcoin.usd), change: Number(c.bitcoin.usd_24h_change || 0), source: "CoinGecko" };
      if (c.ethereum) data.ETH = { price: Number(c.ethereum.usd), change: Number(c.ethereum.usd_24h_change || 0), source: "CoinGecko" };
    } catch {}
  })());
  await Promise.all(jobs);
  return NextResponse.json({ fetchedAt: new Date().toISOString(), data, live: Object.keys(data).length > 0, sources: ["Yahoo Finance", "CoinGecko"] });
}

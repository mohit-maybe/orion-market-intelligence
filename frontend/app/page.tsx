"use client";

import { useEffect, useMemo, useState } from "react";

type Action = "BUY" | "SELL" | "HOLD";
type Trade = { id: number; symbol: string; action: Action; qty: number; price: number; time: string; pnl: number };
type Position = { symbol: string; allocation: number; qty: number; avg: number; price: number; pnl: number; action: Action };

const seedPositions: Position[] = [
  { symbol: "NVDA", allocation: 28, qty: 14, avg: 172.2, price: 180.46, pnl: 115.64, action: "BUY" },
  { symbol: "BTC", allocation: 21, qty: 0.31, avg: 110400, price: 114200, pnl: 1178, action: "HOLD" },
  { symbol: "MSFT", allocation: 17, qty: 8, avg: 514.2, price: 528.1, pnl: 111.2, action: "BUY" },
  { symbol: "ETH", allocation: 12, qty: 2.2, avg: 4120, price: 4058, pnl: -136.4, action: "SELL" },
];
const seedTrades: Trade[] = [
  { id: 17, symbol: "NVDA", action: "BUY", qty: 4, price: 179.1, time: "14:42", pnl: 54.2 },
  { id: 16, symbol: "ETH", action: "SELL", qty: 0.7, price: 4072, time: "13:18", pnl: -18.4 },
  { id: 15, symbol: "MSFT", action: "BUY", qty: 2, price: 525.3, time: "11:56", pnl: 27.6 },
  { id: 14, symbol: "BTC", action: "HOLD", qty: 0, price: 113840, time: "10:22", pnl: 0 },
];

const news = [
  ["NVDA", "AI infrastructure demand keeps semiconductor complex in focus", "Reuters", "+0.72"],
  ["BTC", "Digital assets trade cautiously as macro expectations shift", "MarketWire", "+0.14"],
  ["MSFT", "Cloud and enterprise AI spending remains a key growth theme", "Financial Times", "+0.61"],
  ["ETH", "Crypto risk appetite softens across major tokens", "CoinDesk", "-0.34"],
];

export default function Home() {
  const [tab, setTab] = useState("Command Center");
  const [positions, setPositions] = useState(seedPositions);
  const [trades, setTrades] = useState(seedTrades);
  const [capital, setCapital] = useState(100000);
  const [toast, setToast] = useState("");
  const [running, setRunning] = useState(false);
  const [training, setTraining] = useState(false);
  const [modelVersion, setModelVersion] = useState(184);
  const [accuracy, setAccuracy] = useState(67.4);
  const [lastSync, setLastSync] = useState("just now");

  const portfolioValue = useMemo(() => capital + positions.reduce((sum, p) => sum + p.qty * p.price, 0), [capital, positions]);
  const invested = portfolioValue - capital;

  useEffect(() => {
    const id = setInterval(() => setLastSync("a few seconds ago"), 30000);
    return () => clearInterval(id);
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function runCycle() {
    setRunning(true);
    notify("ORION is ingesting evidence and scoring the market…");
    window.setTimeout(() => {
      setRunning(false);
      setLastSync("just now");
      notify("Cycle complete · 4 assets evaluated · 2 signals changed");
    }, 1200);
  }

  function placePaperOrder(symbol: string, action: Action) {
    const position = positions.find(p => p.symbol === symbol);
    const price = position?.price ?? 100;
    const qty = 1;
    const cost = price * qty;
    if (action === "BUY" && capital < cost) return notify("Order rejected · insufficient paper cash");
    setCapital(c => action === "BUY" ? c - cost : c + cost);
    setTrades(t => [{ id: Date.now(), symbol, action, qty, price, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), pnl: 0 }, ...t].slice(0, 12));
    notify(`${action} ${symbol} · paper order filled`);
  }

  function train() {
    setTraining(true);
    notify("Training Lab · evaluating locked predictions against outcomes…");
    window.setTimeout(() => {
      setModelVersion(v => v + 1);
      setAccuracy(a => Math.min(89.9, +(a + 0.7).toFixed(1)));
      setTraining(false);
      notify("New candidate evaluated · model improved · lesson stored");
    }, 1500);
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">O</span><div><b>ORION</b><small>MARKET INTELLIGENCE</small></div></div>
      <div className="mode"><span className="live-dot"/> PAPER ENVIRONMENT <strong>LIVE</strong></div>
      <nav>{["Command Center", "Decisions", "Portfolio", "Intelligence", "Training Lab", "Trade Journal"].map(item => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <div className="sidebar-bottom"><div className="model-chip"><span>MODEL</span><b>online-logistic-{modelVersion}</b><em>● ADAPTIVE</em></div><div className="sync">DATA SYNCED<br/><b>{lastSync}</b></div></div>
    </aside>

    <section className="workspace">
      <header className="topbar"><div><span className="eyebrow">{tab}</span><h1>{tab === "Command Center" ? "Market command center" : tab}</h1></div><div className="top-actions"><button className="ghost" onClick={runCycle}>{running ? "RUNNING…" : "↻ RUN CYCLE"}</button><span className="status-pill"><i/> PAPER TRADING</span></div></header>

      {tab === "Command Center" && <>
        <section className="hero-grid"><div className="hero-card"><div className="hero-kicker">ADAPTIVE RESEARCH ENGINE <span>v0.2</span></div><h2>Observe. Decide.<br/><i>Learn.</i></h2><p>ORION turns market evidence into locked predictions, paper trades and measurable lessons. Nothing is allowed to rewrite history.</p><button onClick={() => setTab("Decisions")} className="primary">Explore decisions <span>→</span></button></div><div className="regime-card"><div className="label">CURRENT REGIME</div><div className="regime">Risk-on <span>+0.68</span></div><div className="regime-bars"><i style={{width:"76%"}}/><i style={{width:"54%"}}/><i style={{width:"34%"}}/></div><div className="regime-meta"><span>Momentum</span><span>Macro</span><span>Volatility</span></div></div></section>

        <section className="metrics"><Metric label="Portfolio value" value={`$${portfolioValue.toLocaleString(undefined,{maximumFractionDigits:0})}`} sub="+8.42% all time" good/><Metric label="Today's P&L" value="+$1,937" sub="+1.82% vs yesterday" good/><Metric label="Win rate" value={`${accuracy.toFixed(1)}%`} sub={`${trades.length + 1267} evaluated decisions`}/><Metric label="Model confidence" value="72.0%" sub={`v${modelVersion} · adaptive`}/></section>

        <section className="content-grid"><Panel title="Portfolio performance" meta="30D · PAPER EQUITY"><EquityChart/></Panel><Panel title="Allocation" meta="CURRENT"><Donut positions={positions}/></Panel><Panel title="Live intelligence" meta="4 SIGNALS"><div className="signal-list">{news.map(([s,title,source,sent]) => <div className="signal" key={s}><div className="signal-symbol">{s}</div><div className="signal-copy"><b>{title}</b><small>{source} · sentiment {sent}</small></div><span className={Number(sent)>0?"up":"down"}>{Number(sent)>0?"BULLISH":"BEARISH"}</span></div>)}</div></Panel><Panel title="Learning engine" meta={`SESSION #${modelVersion - 167}`}><div className="learning-head"><strong>{accuracy.toFixed(1)}%</strong><span>directional accuracy</span></div><div className="progress"><i style={{width:`${accuracy}%`}}/></div><div className="lesson"><span>✦</span><div><b>Latest lesson</b><p>News sentiment is less reliable during high-volatility macro regimes. Weight reduced 4.2%.</p></div></div><button className="text-btn" onClick={() => setTab("Training Lab")}>Open Training Lab →</button></Panel></section>
      </>}

      {tab === "Decisions" && <Decisions positions={positions} onOrder={placePaperOrder}/>} 
      {tab === "Portfolio" && <Portfolio positions={positions} trades={trades} value={portfolioValue}/>} 
      {tab === "Intelligence" && <Intelligence/>}
      {tab === "Training Lab" && <TrainingLab accuracy={accuracy} version={modelVersion} training={training} onTrain={train}/>} 
      {tab === "Trade Journal" && <Journal trades={trades}/>} 

      {toast && <div className="toast">{toast}</div>}
    </section>
  </main>
}

function Metric({label,value,sub,good=false}:{label:string,value:string,sub:string,good?:boolean}){return <div className="metric"><span>{label}</span><strong className={good?"good":""}>{value}</strong><small>{sub}</small></div>}
function Panel({title,meta,children}:{title:string,meta:string,children:React.ReactNode}){return <section className="panel"><header><div><span>{title}</span><small>{meta}</small></div><b>•••</b></header>{children}</section>}
function EquityChart(){return <div className="chart-wrap"><svg viewBox="0 0 700 220" preserveAspectRatio="none" className="line-chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopOpacity=".24"/><stop offset="1" stopOpacity="0"/></linearGradient></defs><path d="M0 177 C50 170 65 181 105 155 S165 164 205 140 S250 144 290 119 S350 135 390 103 S450 111 495 74 S555 98 595 58 S650 65 700 35 L700 220 L0 220Z" fill="url(#area)"/><path d="M0 177 C50 170 65 181 105 155 S165 164 205 140 S250 144 290 119 S350 135 390 103 S450 111 495 74 S555 98 595 58 S650 65 700 35" fill="none" stroke="currentColor" strokeWidth="3"/></svg><div className="axis"><span>JUL 28</span><span>AUG 05</span><span>AUG 12</span><span>AUG 19</span><span>TODAY</span></div></div>}
function Donut({positions}:{positions:Position[]}){const total=positions.reduce((a,p)=>a+p.allocation,0); let offset=0; return <div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(from -90deg, #a78bfa 0 ${positions[0].allocation/total*100}%, #55d6be ${positions[0].allocation/total*100}% ${(positions[0].allocation+positions[1].allocation)/total*100}%, #ffb86b ${(positions[0].allocation+positions[1].allocation)/total*100}% ${(positions[0].allocation+positions[1].allocation+positions[2].allocation)/total*100}%, #7dd3fc ${(positions[0].allocation+positions[1].allocation+positions[2].allocation)/total*100}% 100%)`}}><div><b>78%</b><small>INVESTED</small></div></div><div className="legend">{positions.map((p,i)=><span key={p.symbol}><i className={`dot d${i}`}/>{p.symbol}<b>{p.allocation}%</b></span>)}</div></div>}
function Decisions({positions,onOrder}:{positions:Position[],onOrder:(s:string,a:Action)=>void}){return <div className="page-grid"><Panel title="Active model decisions" meta="LIVE"><div className="decision-table">{positions.map(p=><div className="decision" key={p.symbol}><div><b>{p.symbol}</b><small>Evidence composite · news + momentum + fundamentals</small></div><span className={p.action === "SELL"?"down":"up"}>{p.action}</span><strong>{p.action === "BUY"?"82":p.action === "SELL"?"73":"51"}%</strong><button onClick={()=>onOrder(p.symbol,p.action === "SELL"?"SELL":"BUY")}>PAPER {p.action === "SELL"?"SELL":"BUY"}</button></div>)}</div></Panel><Panel title="Decision controls" meta="GUARDRAILS"><div className="controls"><label>Maximum position <b>28%</b></label><div className="slider"><i style={{width:"28%"}}/></div><label>Confidence threshold <b>65%</b></label><div className="slider"><i style={{width:"65%"}}/></div><label>Risk mode <b>Moderate</b></label><div className="risk-options"><button>Conservative</button><button className="selected">Moderate</button><button>Aggressive</button></div></div></Panel></div>}
function Portfolio({positions,trades,value}:{positions:Position[],trades:Trade[],value:number}){return <div className="page-grid"><Panel title="Portfolio overview" meta="PAPER ACCOUNT"><div className="big-stat">${value.toLocaleString(undefined,{maximumFractionDigits:0})}<small>+8.42% return · $100,000 starting capital</small></div><div className="allocation-rows">{positions.map(p=><div key={p.symbol}><b>{p.symbol}</b><div><i style={{width:`${p.allocation}%`}}/></div><span>{p.allocation}%</span><em className={p.pnl>=0?"up":"down"}>{p.pnl>=0?"+":""}${p.pnl.toFixed(0)}</em></div>)}</div></Panel><Panel title="Recent execution" meta={`${trades.length} TRADES`}><Journal trades={trades}/></Panel></div>}
function Intelligence(){return <div className="page-grid"><Panel title="Global evidence feed" meta="REAL-TIME READY"><div className="feed">{news.concat([["MACRO","Central-bank expectations remain the dominant cross-asset driver","ORION macro monitor","+0.09"]]).map((n,i)=><article key={i}><span className="feed-time">{i<4?`${i+1}m`:"8m"} ago</span><div><b>{n[0]}</b><h3>{n[1]}</h3><small>{n[2]} · normalized evidence · sentiment {n[3]}</small></div><span className="confidence">{Math.round(55+Math.abs(Number(n[3]))*40)}%</span></article>)}</div></Panel><Panel title="Evidence quality" meta="LAST 24H"><div className="quality"><strong>91.4%</strong><span>source consistency</span><div className="quality-grid"><b>Credibility <i>94%</i></b><b>Novelty <i>81%</i></b><b>Relevance <i>93%</i></b><b>Duplication removed <i>27%</i></b></div></div></Panel></div>}
function TrainingLab({accuracy,version,training,onTrain}:{accuracy:number,version:number,training:boolean,onTrain:()=>void}){return <div className="training"><div className="training-banner"><div><span className="eyebrow">MODEL DEVELOPMENT</span><h2>Training Lab</h2><p>Every locked prediction becomes an experience. ORION tests candidate models on unseen outcomes before promotion.</p></div><button className="primary" onClick={onTrain}>{training?"EVALUATING…":"RUN TRAINING SESSION →"}</button></div><div className="train-grid"><Panel title="Model evolution" meta="WALK-FORWARD"><div className="evolution">{[54,57,61,63,65,accuracy].map((a,i)=><div key={i}><span>v{version-5+i}</span><i style={{height:`${a}%`}}/><b>{a.toFixed(1)}%</b></div>)}</div></Panel><Panel title="Current model" meta="PRODUCTION RESEARCH"><div className="model-overview"><strong>{accuracy.toFixed(1)}%</strong><span>directional accuracy</span><hr/><div><b>online-logistic-{version}</b><small>{version-167} training sessions · {1267+version-184} experiences</small></div></div></Panel><Panel title="Learned lessons" meta="37 STORED"><div className="lessons"><p><i>01</i> High-volatility regimes reduce raw sentiment reliability.</p><p><i>02</i> Volume confirmation improves momentum signals.</p><p><i>03</i> Confidence above 80% needs stronger independent evidence.</p></div></Panel><Panel title="Training safeguards" meta="ACTIVE"><div className="safeguards"><span>✓ No look-ahead leakage</span><span>✓ Locked predictions</span><span>✓ Unseen validation</span><span>✓ Versioned weights</span><span>✓ Paper execution only</span></div></Panel></div></div>}
function Journal({trades}:{trades:Trade[]}){return <div className="journal">{trades.map(t=><div className="journal-row" key={t.id}><span>#{t.id}</span><b>{t.symbol}</b><strong className={t.action === "SELL"?"down":"up"}>{t.action}</strong><span>{t.qty} units</span><span>${t.price.toLocaleString()}</span><span>{t.time}</span><em className={t.pnl>=0?"up":"down"}>{t.pnl?`${t.pnl>0?"+":""}$${t.pnl.toFixed(2)}`:"—"}</em></div>)}</div>}

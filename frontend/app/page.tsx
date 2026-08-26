"use client";

import { useMemo, useState } from "react";

type Tab = "command" | "decisions" | "portfolio" | "intelligence" | "training" | "journal";
type Decision = { symbol: string; action: "BUY" | "SELL" | "HOLD"; confidence: number; score: number; thesis: string };

const initialDecisions: Decision[] = [
  { symbol: "NVDA", action: "BUY", confidence: 82, score: 0.64, thesis: "Momentum and fundamentals are positive; news velocity supports the setup." },
  { symbol: "BTC", action: "HOLD", confidence: 61, score: 0.08, thesis: "Positive sentiment is offset by elevated macro uncertainty." },
  { symbol: "MSFT", action: "BUY", confidence: 74, score: 0.39, thesis: "Stable trend and fundamentals produce a moderate positive signal." },
  { symbol: "ETH", action: "SELL", confidence: 69, score: -0.44, thesis: "Momentum has weakened while risk remains elevated." },
];

const news = [
  ["NVDA", "Earnings expectations and AI infrastructure demand remain a major catalyst.", "MarketWire", "4m"],
  ["BTC", "Macro sensitivity remains elevated across digital assets.", "CryptoDesk", "11m"],
  ["MSFT", "Cloud growth remains a key fundamental signal for the software sector.", "Finance Daily", "24m"],
  ["ETH", "Risk appetite has softened across large-cap crypto assets.", "Digital Markets", "31m"],
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("command");
  const [decisions, setDecisions] = useState(initialDecisions);
  const [trades, setTrades] = useState<Array<{symbol:string;action:string;price:number;qty:number;time:string}>>([]);
  const [running, setRunning] = useState(false);
  const [training, setTraining] = useState(false);
  const [modelVersion, setModelVersion] = useState(17);
  const [lessons, setLessons] = useState(37);
  const [toast, setToast] = useState("");

  const portfolioValue = 108421 + trades.reduce((sum, t) => sum + (t.action === "BUY" ? -t.price*t.qty : t.price*t.qty), 0);
  const positions = useMemo(() => {
    const base: Record<string, number> = { NVDA: 28, BTC: 21, MSFT: 17, ETH: 12 };
    for (const t of trades) base[t.symbol] = Math.max(0, (base[t.symbol] || 0) + (t.action === "BUY" ? 2 : -2));
    return base;
  }, [trades]);

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2200); }

  function runCycle() {
    setRunning(true); notify("ORION is ingesting evidence…");
    window.setTimeout(() => { setDecisions(d => d.map(x => ({...x, confidence: Math.min(95, Math.max(45, x.confidence + (Math.random()>.5?2:-2)))}))); setRunning(false); notify("Research cycle complete · signals refreshed"); }, 900);
  }

  function execute(symbol: string, action: "BUY"|"SELL") {
    const price = symbol === "NVDA" ? 182.4 : symbol === "BTC" ? 112400 : symbol === "MSFT" ? 512.1 : 4320;
    setTrades(t => [{symbol, action, price, qty: 1, time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}, ...t]);
    notify(`${action} ${symbol} · paper order executed`);
  }

  function train() {
    setTraining(true); notify("Training Lab is evaluating completed predictions…");
    window.setTimeout(() => { setModelVersion(v => v + 1); setLessons(l => l + 2); setTraining(false); notify("Training complete · new model candidate created"); }, 1200);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">O</span><div><strong>ORION</strong><small>MARKET INTELLIGENCE</small></div></div>
      <div className="mode"><span/> PAPER RESEARCH MODE</div>
      <nav>{([['command','Command Center','⌂'],['decisions','Decisions','◈'],['portfolio','Portfolio','◒'],['intelligence','Intelligence','◎'],['training','Training Lab','ϟ'],['journal','Trade Journal','≡']] as const).map(([id,label,icon]) => <button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><i>{icon}</i>{label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="model-chip"><span>MODEL</span><b>online-logistic-{modelVersion}</b><em>LIVE</em></div><small>Research build 0.4.0</small></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><span className="eyebrow">AUTONOMOUS RESEARCH TERMINAL</span><h1>{tabTitle(tab)}</h1></div><div className="top-actions"><button className="ghost" onClick={runCycle}>{running ? "RUNNING…" : "↻ RUN CYCLE"}</button><div className="live"><span/> DATA PIPELINE ONLINE</div></div></header>

      {tab === "command" && <Command positions={positions} portfolioValue={portfolioValue} decisions={decisions} onExecute={execute} onTrain={train} training={training} lessons={lessons} modelVersion={modelVersion}/>} 
      {tab === "decisions" && <Decisions decisions={decisions} onExecute={execute}/>} 
      {tab === "portfolio" && <Portfolio positions={positions} value={portfolioValue} trades={trades}/>} 
      {tab === "intelligence" && <Intelligence/>} 
      {tab === "training" && <Training train={train} training={training} lessons={lessons} modelVersion={modelVersion}/>} 
      {tab === "journal" && <Journal trades={trades}/>} 
    </main>
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

function tabTitle(tab: Tab) { return ({command:"Command Center",decisions:"Decision Engine",portfolio:"Paper Portfolio",intelligence:"Market Intelligence",training:"Training Lab",journal:"Trade Journal"}[tab]); }

function Command({positions,value,decisions,onExecute,onTrain,training,lessons,modelVersion}:{positions:Record<string,number>;value:number;decisions:Decision[];onExecute:(s:string,a:"BUY"|"SELL")=>void;onTrain:()=>void;training:boolean;lessons:number;modelVersion:number}) {
 return <>
  <section className="hero"><div><span className="eyebrow violet">ADAPTIVE MARKET INTELLIGENCE</span><h2>The machine that<br/><i>learns from its trades.</i></h2><p>Evidence → prediction → paper execution → outcome → post-mortem → model update. Every decision is frozen before its outcome.</p></div><div className="hero-orbit"><div className="orbit-core">O</div><span className="orb a">NEWS</span><span className="orb b">ML</span><span className="orb c">RISK</span></div></section>
  <div className="metrics"><Metric label="Portfolio value" value={`$${value.toLocaleString()}`} sub="+$8,421 all time"/><Metric label="Today's P&L" value="+$1,937" sub="+1.82% today" positive/><Metric label="Directional accuracy" value="63.4%" sub="1,284 evaluated decisions"/><Metric label="Model confidence" value="72%" sub={`version ${modelVersion}`}/></div>
  <div className="section-grid"><Panel title="EQUITY CURVE" meta="30D · PAPER"><Equity/></Panel><Panel title="ALLOCATION" meta="CURRENT"><Allocation positions={positions}/></Panel></div>
  <div className="section-grid"><Panel title="TOP DECISIONS" meta="LIVE"><div className="decision-list">{decisions.map(d=><div className="decision" key={d.symbol}><div className="ticker">{d.symbol}<small>{d.thesis}</small></div><div className={`signal ${d.action.toLowerCase()}`}>{d.action}<small>{d.confidence}%</small></div><button className="tiny" onClick={()=>d.action!=="HOLD"&&onExecute(d.symbol,d.action)}>PAPER {d.action}</button></div>)}</div></Panel><Panel title="LEARNING ENGINE" meta={`SESSION #${modelVersion}`}><div className="learning"><div className="learning-big">{lessons}<small>lessons discovered</small></div><div className="progress"><span style={{width:"72%"}}/></div><p>Latest lesson: social sentiment spikes become less reliable during high-volatility macro regimes.</p><button className="primary" onClick={onTrain}>{training?"EVALUATING…":"RUN TRAINING SESSION →"}</button></div></Panel></div>
 </>
}

function Decisions({decisions,onExecute}:{decisions:Decision[];onExecute:(s:string,a:"BUY"|"SELL")=>void}) { return <div className="full-card"><div className="table-head"><span>ASSET</span><span>SIGNAL</span><span>CONFIDENCE</span><span>SCORE</span><span>ACTION</span></div>{decisions.map(d=><div className="table-row" key={d.symbol}><b>{d.symbol}</b><span className={`signal ${d.action.toLowerCase()}`}>{d.action}</span><strong>{d.confidence}%</strong><span>{d.score>0?"+":""}{d.score.toFixed(2)}</span><button className="primary small" disabled={d.action==="HOLD"} onClick={()=>onExecute(d.symbol,d.action)}>PAPER {d.action}</button><p>{d.thesis}</p></div>)}</div> }

function Portfolio({positions,value,trades}:{positions:Record<string,number>;value:number;trades:Array<{symbol:string;action:string;price:number;qty:number;time:string}>}) { return <><div className="metrics"><Metric label="Equity" value={`$${value.toLocaleString()}`} sub="Paper account"/><Metric label="Cash" value="$22,400" sub="Available"/><Metric label="Return" value="+8.42%" sub="Since inception" positive/><Metric label="Drawdown" value="-3.8%" sub="Maximum"/></div><div className="section-grid"><Panel title="POSITION ALLOCATION"><Allocation positions={positions}/></Panel><Panel title="RISK SNAPSHOT"><Risk/></Panel></div><Panel title="EXECUTION HISTORY"><JournalTable trades={trades}/></Panel></> }

function Intelligence() { return <><div className="intel-grid">{news.map(([symbol,title,source,time])=><article className="news" key={symbol+time}><div className="news-top"><b>{symbol}</b><span>{time} ago</span></div><h3>{title}</h3><div className="news-bottom"><span>{source}</span><em>Evidence</em></div></article>)}</div><div className="section-grid"><Panel title="EVIDENCE SYNTHESIS"><div className="evidence"><Bar label="News sentiment" value={74}/><Bar label="Price momentum" value={67}/><Bar label="Fundamentals" value={81}/><Bar label="Macro" value={42}/><Bar label="Risk" value={31}/></div></Panel><Panel title="MARKET REGIME"><div className="regime"><strong>RISK-ON</strong><span>0.71 confidence</span><p>Growth assets are showing positive breadth while volatility remains above baseline. ORION is reducing confidence where macro uncertainty conflicts with company-specific evidence.</p></div></Panel></div></> }

function Training({train,training,lessons,modelVersion}:{train:()=>void;training:boolean;lessons:number;modelVersion:number}) { return <><div className="training-hero"><div><span className="eyebrow violet">MODEL DEVELOPMENT</span><h2>Training Lab</h2><p>ORION evaluates completed predictions on unseen outcomes, records mistakes, and creates a candidate model. Promotion requires validation.</p></div><button className="primary" onClick={train}>{training?"TRAINING…":"RUN TRAINING SESSION"}</button></div><div className="metrics"><Metric label="Current model" value={`v${modelVersion}`} sub="Online logistic"/><Metric label="Accuracy" value="63.4%" sub="Walk-forward"/><Metric label="Lessons" value={String(lessons)} sub="Post-mortems"/><Metric label="MAE" value="2.7%" sub="Mean absolute error"/></div><div className="model-timeline">{[54,57,61,63,67].map((v,i)=><div key={v} className={i===4?'current':''}><span>v{i+1}</span><i style={{height:`${v}%`}}/><b>{v}%</b></div>)}</div><Panel title="LATEST LESSONS"><div className="lesson"><b>LESSON #{lessons}</b><h3>Sentiment needs regime awareness</h3><p>Recent post-mortems indicate that sentiment-only signals degrade when volatility and macro uncertainty rise together.</p><span>→ candidate feature interaction added</span></div></Panel></> }

function Journal({trades}:{trades:Array<{symbol:string;action:string;price:number;qty:number;time:string}>}) { return <Panel title="PAPER TRADE JOURNAL" meta="AUDIT LOG"><JournalTable trades={trades}/></Panel> }
function JournalTable({trades}:{trades:Array<{symbol:string;action:string;price:number;qty:number;time:string}>}) { return <div className="journal-table">{trades.length===0?<div className="empty">No manual paper executions yet. Run a cycle or execute a decision to populate the journal.</div>:trades.map((t,i)=><div className="jrow" key={i}><b>{t.symbol}</b><span className={`signal ${t.action.toLowerCase()}`}>{t.action}</span><span>{t.qty} unit</span><span>${t.price.toLocaleString()}</span><span>{t.time}</span><em>FILLED</em></div>)}</div> }

function Metric({label,value,sub,positive=false}:{label:string;value:string;sub:string;positive?:boolean}) { return <div className="metric"><span>{label}</span><strong className={positive?"positive":""}>{value}</strong><small>{sub}</small></div> }
function Panel({title,meta,children}:{title:string;meta?:string;children:React.ReactNode}) { return <section className="panel"><div className="panel-head"><span>{title}</span><em>{meta}</em></div>{children}</section> }
function Equity(){const pts=[24,31,29,42,38,49,46,58,54,66,61,72,69,81,78,91];return <div className="equity"><svg viewBox="0 0 800 240" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8b7cff" stopOpacity=".32"/><stop offset="1" stopColor="#8b7cff" stopOpacity="0"/></linearGradient></defs><path d={`M0,220 ${pts.map((p,i)=>`L${i*53},${220-p*2}`).join(" ")} L800,220 Z`} fill="url(#area)"/><polyline points={pts.map((p,i)=>`${i*53},${220-p*2}`).join(" ")} fill="none" stroke="#9a8cff" strokeWidth="3"/></svg><div className="axis"><span>30D AGO</span><span>NOW</span></div></div>}
function Allocation({positions}:{positions:Record<string,number>}){return <div className="allocation"><div className="donut" style={{background:`conic-gradient(#9a8cff 0 ${positions.NVDA}%, #61e7c8 ${positions.NVDA}% ${positions.NVDA+positions.BTC}%, #65b9ff ${positions.NVDA+positions.BTC}% ${positions.NVDA+positions.BTC+positions.MSFT}%, #ff9c6b ${positions.NVDA+positions.BTC+positions.MSFT}% ${positions.NVDA+positions.BTC+positions.MSFT+positions.ETH}%, #222936 0)`}}><div>$108K</div></div><div className="legend">{Object.entries(positions).map(([k,v])=><div key={k}><i/> <b>{k}</b><span>{v}%</span></div>)}</div></div>}
function Risk(){return <div className="risk"><Bar label="Portfolio volatility" value={38}/><Bar label="Concentration" value={44}/><Bar label="Model uncertainty" value={29}/><Bar label="Liquidity risk" value={18}/><p>Risk engine is currently operating inside paper-account limits.</p></div>}
function Bar({label,value}:{label:string;value:number}){return <div className="barline"><div><span>{label}</span><b>{value}%</b></div><i><em style={{width:`${value}%`}}/></i></div>}

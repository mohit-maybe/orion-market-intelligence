"use client";

const positions = [
  ["NVDA", "28%", "BUY", "+4.8%"],
  ["BTC", "21%", "HOLD", "+1.7%"],
  ["MSFT", "17%", "BUY", "+2.9%"],
  ["ETH", "12%", "SELL", "-1.4%"],
];

export default function Home() {
  return <main className="shell">
    <header className="topbar"><div className="brand">ORION<span>·</span></div><nav className="nav"><b>Command Center</b><span>Decisions</span><span>Portfolio</span><span>Training Lab</span></nav><div className="status">● PAPER MODE</div></header>
    <section className="card hero"><div className="label">Adaptive market intelligence</div><h1>The machine that<br/>learns from its trades.</h1><p>ORION combines market evidence, research signals and paper-trading outcomes into an auditable learning loop. Every prediction is frozen before its outcome and every mistake becomes training evidence.</p></section>
    <section className="grid">
      <Metric label="Portfolio" value="$108,421" sub="+$8,421 all time" />
      <Metric label="Today" value="+1.82%" sub="+$1,937 today" positive />
      <Metric label="Win rate" value="63.4%" sub="1,284 evaluated decisions" />
      <Metric label="AI confidence" value="72%" sub="Current market regime" />
      <section className="card wide"><div className="label">Portfolio performance</div><div className="value">+8.42%</div><div className="chart">{[30,48,41,62,55,74,68,88,79,96,91,100].map((h,i)=><i className="bar" style={{height:`${h}%`}} key={i}/>)}</div><div className="mini">30D equity curve · illustrative paper portfolio</div></section>
      <section className="card wide"><div className="label">Current positions</div>{positions.map(([asset,allocation,action,ret])=><div className="row" key={asset}><div><div className="asset">{asset}</div><div className="mini">{allocation} allocation</div></div><span className="pill">{action}</span><span className={ret.startsWith("-")?"muted":"positive"}>{ret}</span></div>)}</section>
      <section className="card wide"><div className="label">Latest intelligence</div><div className="row"><div><div className="asset">NVDA · BUY</div><div className="mini">Fundamentals + momentum + positive news velocity</div></div><strong>82%</strong></div><div className="row"><div><div className="asset">BTC · HOLD</div><div className="mini">Sentiment positive, macro uncertainty elevated</div></div><strong>61%</strong></div></section>
      <section className="card wide"><div className="label">Learning engine · Session #17</div><div className="value">1,284 <span className="mini">trades analyzed</span></div><div className="score"><i/></div><p className="mini">37 lessons discovered · Latest lesson: social sentiment spikes are less reliable during high-volatility macro regimes.</p></section>
    </section>
  </main>
}

function Metric({label,value,sub,positive=false}:{label:string,value:string,sub:string,positive?:boolean}){return <section className="card"><div className="label">{label}</div><div className={`value ${positive?"positive":""}`}>{value}</div><div className="mini">{sub}</div></section>}

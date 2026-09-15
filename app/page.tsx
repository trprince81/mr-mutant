'use client';

import { FormEvent, useEffect, useState } from 'react';

type Report = { category: string; comment?: string; created_at?: string };
type Result = { found?: boolean; number?: { e164?: string; country_name?: string; carrier?: string; line_type?: string; identity_name?: string; identity_type?: string; risk_score?: number; risk_label?: string }; reports?: number; report_items?: Report[]; sources?: { name: string; fields?: string[] }[]; error?: string };

const API = process.env.NEXT_PUBLIC_LOOKUP_URL || '';

export default function Home() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => { try { setHistory(JSON.parse(localStorage.getItem('mr-mutant-history') || '[]')); } catch {} }, []);

  async function search(e?: FormEvent) {
    e?.preventDefault();
    const value = number.trim();
    if (!value) return;
    setLoading(true); setError(''); setResult(null);
    try {
      if (!API) throw new Error('El servicio de búsqueda todavía no está configurado.');
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: value }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'No se pudo consultar el número.');
      setResult(data);
      const next = [value, ...history.filter(x => x !== value)].slice(0, 8); setHistory(next); localStorage.setItem('mr-mutant-history', JSON.stringify(next));
    } catch (err: any) { setError(err?.message || 'Error de conexión.'); }
    finally { setLoading(false); }
  }

  const n = result?.number;
  return <main className="shell">
    <nav><div className="brand"><span className="mark">M</span><span>MR <b>MUTANT</b></span></div><div className="navlinks"><a href="#search">Buscar</a><a href="#history">Historial</a><a href="#report">Reportar</a></div></nav>
    <section className="hero" id="search"><div className="eyebrow">PHONE INTELLIGENCE</div><h1>Descubre qué hay<br/><span>detrás de un número.</span></h1><p>Consulta información disponible de fuentes reales. Sin datos inventados.</p>
      <form onSubmit={search} className="searchbar"><span>⌕</span><input value={number} onChange={e => setNumber(e.target.value)} placeholder="+1 809 000 0000" aria-label="Número telefónico"/><button disabled={loading}>{loading ? 'Consultando…' : 'Buscar'}</button></form>
      {error && <div className="notice error">{error}</div>}
      {result && <ResultCard result={result}/>} 
    </section>
    <section className="features"><div><strong>DATOS REALES</strong><p>Solo mostramos campos devueltos por fuentes configuradas.</p></div><div><strong>REPUTACIÓN</strong><p>Consulta reportes y categorías registradas por usuarios.</p></div><div><strong>PRIVACIDAD</strong><p>Las credenciales de proveedores nunca se exponen al navegador.</p></div></section>
    <section className="history" id="history"><div className="sectionhead"><div><div className="eyebrow">TU ACTIVIDAD</div><h2>Historial reciente</h2></div><span>{history.length} búsquedas</span></div>{history.length ? <div className="historygrid">{history.map(x => <button key={x} onClick={() => {setNumber(x); window.scrollTo({top:0,behavior:'smooth'});}}>{x}<span>→</span></button>)}</div> : <p className="muted">Tus búsquedas aparecerán aquí en este dispositivo.</p>}</section>
    <footer><span>MR MUTANT</span><span>Información basada en fuentes disponibles · 2026</span></footer>
  </main>
}

function ResultCard({ result }: { result: Result }) { const n = result.number; if (!result.found || !n) return <div className="result"><div className="notfound">No encontramos información registrada para este número.</div><small>Esto no significa que el número sea seguro; significa que las fuentes consultadas no devolvieron datos.</small></div>;
  return <div className="result"><div className="resulttop"><div><small>NÚMERO CONSULTADO</small><h2>{n.e164 || 'Disponible'}</h2></div><Risk label={n.risk_label} score={n.risk_score}/></div><div className="facts"><Fact k="País" v={n.country_name}/><Fact k="Operador" v={n.carrier}/><Fact k="Tipo de línea" v={n.line_type}/><Fact k="Identidad" v={n.identity_name}/></div><div className="reports"><div><b>{result.reports || 0}</b><span>reportes registrados</span></div>{result.report_items?.slice(0,4).map((r,i)=><div className="report" key={i}><b>{r.category}</b><span>{r.comment || 'Sin comentario'}</span></div>)}</div><div className="source">Fuentes: {result.sources?.map(s=>s.name).join(' · ') || 'ninguna fuente identificada'}</div></div>
}
function Fact({k,v}:{k:string;v?:string}) { return <div><span>{k}</span><b>{v || 'No disponible'}</b></div> }
function Risk({label,score}:{label?:string;score?:number}) { return <div className="risk"><span>REPUTACIÓN</span><b>{label || 'No disponible'}</b>{typeof score === 'number' && <i>{score}/100</i>}</div> }

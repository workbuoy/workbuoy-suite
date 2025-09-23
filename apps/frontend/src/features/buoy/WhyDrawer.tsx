import React, { useEffect, useMemo, useRef } from "react";

type ExplanationIn = string | {
  title?: string;
  quote?: string;
  link?: string;
  source?: string; // e.g. "CRM", "ERP", "E-post"
};

type Props = {
  explanations: ExplanationIn[];
  onClose: ()=>void;
  title?: string;
};

type Explanation = { title?:string; quote?:string; link?:string; source?:string };

function normalize(ex: ExplanationIn): Explanation {
  if (typeof ex === "string") {
    // very light link detection
    const m = ex.match(/https?:\/\/\S+/);
    return { quote: ex.replace(m?.[0] ?? "", "").trim() || ex, link: m?.[0] };
  }
  return ex;
}

export default function WhyDrawer({ explanations, onClose, title="Hvorfor anbefales dette?" }: Props){
  const items = useMemo(()=> explanations.map(normalize), [explanations]);
  const firstBtn = useRef<HTMLButtonElement|null>(null);

  // Close on ESC, focus management
  useEffect(()=>{
    const onKey = (e: KeyboardEvent)=> { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(()=> firstBtn.current?.focus(), 0);
    return ()=> { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [onClose]);

  function copyAll(){
    const text = items.map(i => `• ${i.title? i.title + " — " : ""}${i.quote ?? ""}${i.link? " " + i.link : ""}${i.source? " ["+i.source+"]" : ""}`).join("\n");
    navigator.clipboard?.writeText(text).catch(()=>{});
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
         style={{position:"fixed", inset:"auto 0 0 0", background:"rgba(13,17,23,.7)", backdropFilter:"blur(6px)", zIndex:9999}}>
      <div className="cardbg" style={{margin:"0 auto", maxWidth:760, borderTopLeftRadius:16, borderTopRightRadius:16, padding:16}}>
        <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
          <strong>{title}</strong>
          <div style={{display:"flex", gap:6}}>
            <button ref={firstBtn} className="chip" onClick={copyAll} title="Kopier sitater">Kopier</button>
            <button className="chip" onClick={onClose} title="Lukk (Esc)">Lukk</button>
          </div>
        </header>

        <div style={{marginTop:12, display:"grid", gap:10}}>
          {items.map((e, idx) => (
            <article key={idx} className="row" style={{border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:12}}>
              {(e.title || e.source) && (
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <div style={{fontWeight:600}}>{e.title || e.source}</div>
                  {e.source && <span className="chip" aria-label="Kilde">{e.source}</span>}
                </div>
              )}
              {e.quote && <blockquote style={{margin:0, opacity:.95, lineHeight:1.4}}>
                “{e.quote}”
              </blockquote>}
              {e.link && (
                <div style={{marginTop:8}}>
                  <a className="chip" href={e.link} target="_blank" rel="noreferrer" title="Åpne kilde">Åpne kilde</a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
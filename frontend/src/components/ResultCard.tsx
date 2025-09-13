import React from 'react';
import type { GlobalSearchQuery } from '../buoy/types';

export function ResultCard({ query, data, onOpenNavi }:{query:GlobalSearchQuery, data:any[]|null, onOpenNavi?:()=>void}){
  return (
    <div style={{border:'1px solid rgba(0,0,0,0.1)', borderRadius:12, padding:12, marginTop:12}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <strong>Resultat</strong>
        <div>
          <button onClick={onOpenNavi}>Åpne i Navi</button>
        </div>
      </div>
      {!data || data.length===0 ? <div style={{opacity:0.6}}>Ingen resultater</div> :
        query.viz==='table' ? (
          <table>
            <thead><tr>{Object.keys(data[0]||{}).map(k=> <th key={k}>{k}</th>)}</tr></thead>
            <tbody>{data.map((row,i)=>(
              <tr key={i}>{Object.keys(row).map(k=> <td key={k}>{String(row[k])}</td>)}</tr>
            ))}</tbody>
          </table>
        ) : (
          <div style={{height:120, display:'grid', placeItems:'center'}}>Graf (placeholder: {query.viz})</div>
        )
      }
    </div>
  );
}

import React from 'react';
import { AutonomySlider } from './components/AutonomySlider';
import { TasksPanel } from './components/TasksPanel';
import { LogPanel } from './components/LogPanel';
import { WhyDrawer } from './components/WhyDrawer';

export default function App() {
  const [autonomy, setAutonomy] = React.useState<number>(()=> Number(localStorage.getItem('autonomy')||0));
  const [explanation, setExplanation] = React.useState<any>(null);

  function updateAutonomy(v:number){
    setAutonomy(v);
    localStorage.setItem('autonomy', String(v));
  }

  return (
    <div style={{display:'grid', gap:16, padding:16, maxWidth:900, margin:'0 auto'}}>
      <h2>Workbuoy Navi (MVP)</h2>
      <AutonomySlider value={autonomy} onChange={updateAutonomy}/>
      <div style={{display:'grid', gap:16, gridTemplateColumns:'1fr 1fr'}}>
        <TasksPanel autonomy={autonomy} setExplanation={setExplanation}/>
        <LogPanel autonomy={autonomy} setExplanation={setExplanation}/>
      </div>
      <WhyDrawer explanation={explanation} onClose={()=>setExplanation(null)}/>
    </div>
  );
}

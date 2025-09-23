import React, { useState } from "react";
import { apiWhy } from "../api/whyClient";
import { WhyDrawer } from "./WhyDrawer";

export const WhyAwareAction: React.FC<{ path:string; method:string; body?:any; headers?:Record<string,string>; label?:string }> = ({ path, method, body, headers, label }) => {
  const [explanations, setExplanations] = useState<any[]|undefined>(undefined);
  const [lastStatus, setLastStatus] = useState<number|undefined>(undefined);
  async function go() {
    const r = await apiWhy(path, method, body, headers);
    setLastStatus(r.status);
    if (r.status >= 400 && r.explanations?.length) setExplanations(r.explanations);
    else setExplanations(undefined);
  }
  return (
    <div>
      <button onClick={go}>{label || "Run"}</button>
      {lastStatus && <div>Status: {lastStatus}</div>}
      <WhyDrawer explanations={explanations} />
    </div>
  );
};

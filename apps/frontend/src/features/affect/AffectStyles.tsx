import React, { useEffect } from "react";
import type { Affect } from "./useTypingAffect";

export default function AffectStyles({ affect }:{ affect: Affect }){
  useEffect(()=>{
    const root = document.documentElement;
    if (affect==="stressed"){
      root.style.setProperty("--btn-scale", "1.08");
      root.style.setProperty("--tap-area", "44px");
    } else if (affect==="focused"){
      root.style.setProperty("--btn-scale", "1.02");
      root.style.setProperty("--tap-area", "40px");
    } else {
      root.style.setProperty("--btn-scale", "1.0");
      root.style.setProperty("--tap-area", "36px");
    }
  }, [affect]);
  return null;
}
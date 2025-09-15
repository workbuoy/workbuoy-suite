import { Router } from "express";

export function coreCompleteRouter(){
  const r = Router();
  r.post("/core/complete", (req, res)=>{
    const text: string = req.body?.text || "";
    const intent = req.body?.intent?.kind || req.wb?.intent || "chat.unknown";
    const autonomy = req.wb?.autonomy ?? 0;

    // Simple policy in this stub: block if autonomy < 1 and intent is "send"/"create"
    if (autonomy < 1 && /(send|create|delete|update)/i.test(String(intent))){
      return res.status(403).json({
        error: "forbidden",
        explanations: [
          { title:"Autonomi", quote:"Nivå 0 tillater ikke denne handlingen uten godkjenning", source:"Policy" },
          { quote:"Øk autonomi i Navi eller be en kollega godkjenne" }
        ]
      });
    }

    const reply = text ? `Stub: mottok '${text}'. Intent=${intent}.` : `Stub: klar.`;
    return res.json({
      text: reply,
      explanations: [
        { title:"Kontekst", quote:`Intent=${intent}`, source:"Header X-WB-Intent" },
        req.wb?.when ? { title:"Tid", quote:String(req.wb.when), source:"Header X-WB-When" } : undefined
      ].filter(Boolean)
    });
  });
  return r;
}
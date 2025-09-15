import { Router } from "express";

const store = new Map<string, any>(); // token -> action

export function registerUndo(token: string, action: any){
  store.set(token, action);
}

export function coreUndoRouter(){
  const r = Router();

  r.post("/core/undo", (req, res)=>{
    const token = String(req.body?.token||"");
    if (!token || !store.has(token)){
      return res.status(200).json({ ok:false, reason:"unknown_token" });
    }
    // In a real impl: apply inverse action
    store.delete(token);
    return res.json({ ok:true });
  });

  return r;
}
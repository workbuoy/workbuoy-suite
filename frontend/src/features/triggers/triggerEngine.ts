import { useEffect } from "react";
import { useActiveContext } from "../../core/ActiveContext";
import { useBuoy } from "../buoy/useBuoy";

export function useTriggerEngine(){
  const { selectedEntity, recentIntents } = useActiveContext();
  const { addSuggestion } = useBuoy();

  useEffect(()=>{
    if (!selectedEntity) return;
    // Example heuristic: if contact opened and "invoice" or "crm" appears in intents → suggest "Send purring"
    if (selectedEntity.type === "contact" && recentIntents.some(x => x.includes("invoice") || x.includes("crm"))) {
      addSuggestion({
        id: "sugg-" + selectedEntity.id,
        label: "Send purring",
        explanation: [
          "Kilde: CRM (utestående faktura NOK 5000)",
          "Mønster: ingen aktivitet på 14 dager"
        ]
      });
    }
  }, [selectedEntity, recentIntents, addSuggestion]);
}
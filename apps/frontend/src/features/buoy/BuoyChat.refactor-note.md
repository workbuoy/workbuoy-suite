# BuoyChat refaktor (PR-3)
Denne PR-en introduserer `ChatMessage.tsx` + `viz/`-komponenter. `BuoyChat.tsx` kan bytte til:
```tsx
import ChatMessage from "./ChatMessage";
// ...
<div style={{overflow:"auto", padding:16}}>
  {messages.map(m => <ChatMessage key={(m as any).id} msg={m as any} />)}
</div>
```
Types ligger i `features/buoy/types.ts`. Ingen endringer i backend/CI.
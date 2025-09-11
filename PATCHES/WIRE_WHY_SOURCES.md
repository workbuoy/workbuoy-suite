# Add sources to explanations

In your Buoy agent or policy guard, after you build the explanation:

```ts
import { policySource, mergeExplanationWithSources } from "../../core/explain/sources";

const expl = buildTemplate({
  mode: decision.mode,
  policy: 1.0, data: 0.8, risk: 0.7,
  basis: `autonomy=${autonomy}; role=${role}`,
  reason: decision.reason
});

const enriched = mergeExplanationWithSources(expl, [policySource(decision.matchedRuleId || "default")]);

res.status(403).json({ error: "policy_denied", explanations: [enriched] });
```

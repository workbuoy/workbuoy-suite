# Environment Variables

| VAR            | Scope       | Required? | Default/Mock in CI | Used by |
|----------------|-------------|-----------|--------------------|---------|
| NODE_ENV       | runtime/ci  | no        | test               | app     |
| OPENAI_API_KEY | runtime     | optional  | mock/no-call       | future  |
| MAPBOX_API_KEY | runtime     | optional  | mock/no-call       | future  |

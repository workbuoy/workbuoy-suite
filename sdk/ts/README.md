# @workbuoy/sdk

Type-definisjoner generert fra WorkBuoy OpenAPI. Installer:
```bash
npm i @workbuoy/sdk
```
Importer typer:
```ts
import type { paths } from '@workbuoy/sdk';
type Contact = paths['/api/v1/crm/contacts']['post']['requestBody']['content']['application/json'];
```

Suggested package.json fields:
{
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc -p .",
    "test": "jest --runInBand",
    "lint": "eslint .",
    "typecheck": "tsc -p . --noEmit",
    "coverage": "jest --coverage --runInBand"
  },
  "dependencies": {
    "express": "^4.19.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.30",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "ts-jest": "^29.1.2",
    "typescript": "^5.4.0",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.57.0"
  }
}

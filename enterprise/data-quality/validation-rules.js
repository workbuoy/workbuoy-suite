export class ValidationRulesEngine {
  constructor() {
    this.rules = new Map();
    this.loadBusinessRules();
  }


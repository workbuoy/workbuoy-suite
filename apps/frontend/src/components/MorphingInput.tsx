import React, { useEffect, useMemo, useState } from "react";
import { morphingInputStrings } from "./morphingInput/strings";

type Contact = { id: string; name: string; email?: string };

type MorphingInputProps = {
  value: string;
  onChange: (value: string) => void;
  contacts?: Contact[];
  onSelectContact?: (contact: Contact) => void;
  placeholder?: string;
  id?: string;
  strings?: Partial<typeof morphingInputStrings>;
  ariaLabel?: string;
  hideLabel?: boolean;
};

type Token = { type: "number" | "operator" | "paren"; value: string };

type Operator = {
  precedence: number;
  assoc: "left" | "right";
  fn: (a: number, b: number) => number;
};

const operators: Record<string, Operator> = {
  "+": { precedence: 1, assoc: "left", fn: (a, b) => a + b },
  "-": { precedence: 1, assoc: "left", fn: (a, b) => a - b },
  "*": { precedence: 2, assoc: "left", fn: (a, b) => a * b },
  "/": { precedence: 2, assoc: "left", fn: (a, b) => a / b },
};

const defaultContacts: Contact[] = [
  { id: "c1", name: "Ola Nordmann", email: "ola@example.com" },
  { id: "c2", name: "Kari Nordmann", email: "kari@example.com" },
  { id: "c3", name: "Per Hansen", email: "per@example.com" },
];

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let idx = 0;
  while (idx < input.length) {
    const ch = input[idx];
    if (ch === " ") {
      idx += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let number = ch;
      idx += 1;
      while (idx < input.length && /[0-9.]/.test(input[idx])) {
        number += input[idx];
        idx += 1;
      }
      if (number.split(".").length > 2) return null;
      tokens.push({ type: "number", value: number });
      continue;
    }
    if (operators[ch]) {
      tokens.push({ type: "operator", value: ch });
      idx += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      idx += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

function evaluateExpression(expression: string): number | null {
  const tokens = tokenize(expression);
  if (!tokens) return null;
  const output: Token[] = [];
  const stack: Token[] = [];
  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
    } else if (token.type === "operator") {
      const op1 = operators[token.value];
      if (!op1) return null;
      while (stack.length) {
        const peek = stack[stack.length - 1];
        if (peek.type === "operator") {
          const op2 = operators[peek.value];
          if (
            op2 &&
            ((op1.assoc === "left" && op1.precedence <= op2.precedence) ||
              (op1.assoc === "right" && op1.precedence < op2.precedence))
          ) {
            output.push(stack.pop()!);
            continue;
          }
        }
        break;
      }
      stack.push(token);
    } else if (token.type === "paren") {
      if (token.value === "(") {
        stack.push(token);
      } else {
        let found = false;
        while (stack.length) {
          const popped = stack.pop()!;
          if (popped.type === "paren" && popped.value === "(") {
            found = true;
            break;
          }
          output.push(popped);
        }
        if (!found) return null;
      }
    }
  }
  while (stack.length) {
    const popped = stack.pop()!;
    if (popped.type === "paren") return null;
    output.push(popped);
  }

  const evalStack: number[] = [];
  for (const token of output) {
    if (token.type === "number") {
      evalStack.push(parseFloat(token.value));
    } else if (token.type === "operator") {
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) return null;
      const op = operators[token.value];
      if (!op) return null;
      const result = op.fn(a, b);
      if (!Number.isFinite(result)) return null;
      evalStack.push(result);
    }
  }
  if (evalStack.length !== 1) return null;
  return Number.parseFloat(evalStack[0].toFixed(4));
}

function looksLikeExpression(value: string) {
  if (!value.trim()) return false;
  return /^[0-9+\-*/().\s]+$/.test(value);
}

const namePattern = /^[a-zA-ZæøåÆØÅ]+\s+[a-zA-ZæøåÆØÅ\-\s]+$/u;

export function MorphingInput({
  value,
  onChange,
  contacts = defaultContacts,
  onSelectContact,
  placeholder,
  id = "morphing-input",
  strings = {},
  ariaLabel,
  hideLabel = false,
}: MorphingInputProps) {
  const mergedStrings = { ...morphingInputStrings, ...strings };
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const contactMatches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query || (!namePattern.test(value.trim()) && query.length < 2)) return [];
    return contacts.filter((contact) => contact.name.toLowerCase().includes(query));
  }, [contacts, value]);

  const expressionResult = useMemo(() => {
    if (!looksLikeExpression(value)) return null;
    return evaluateExpression(value);
  }, [value]);

  useEffect(() => {
    if (contactMatches.length) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [contactMatches.length]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!contactMatches.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % contactMatches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + contactMatches.length) % contactMatches.length);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const contact = contactMatches[activeIndex];
      if (contact) {
        onSelectContact?.(contact);
        onChange(contact.name);
      }
    }
  }

  return (
    <div className="grid gap-2" aria-live="polite">
      <label
        htmlFor={id}
        className={hideLabel ? 'text-xs font-medium text-slate-300' : 'text-xs font-medium text-slate-300'}
        style={hideLabel ? { position: 'absolute', clip: 'rect(0 0 0 0)', width: 1, height: 1, margin: -1, border: 0, padding: 0 } : undefined}
      >
        {mergedStrings.label}
      </label>
      <div
        role="combobox"
        aria-expanded={contactMatches.length > 0}
        aria-owns={contactMatches.length ? `${id}-contacts` : undefined}
        aria-haspopup="listbox"
        className="relative"
      >
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-controls={contactMatches.length ? `${id}-contacts` : undefined}
          aria-activedescendant={
            contactMatches.length && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-md border border-slate-800 bg-slate-900/60 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
        {contactMatches.length > 0 && (
          <ul
            id={`${id}-contacts`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-800 bg-slate-900/95 text-sm shadow-lg"
          >
            <li className="px-3 py-2 text-xs uppercase tracking-wide text-slate-400">
              {mergedStrings.contactPickerHeading}
            </li>
            {contactMatches.map((contact, index) => (
              <li
                key={contact.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                className={`flex items-center justify-between px-3 py-2 hover:bg-slate-800 ${
                  activeIndex === index ? "bg-slate-800/80" : ""
                }`}
              >
                <span>
                  <span className="block font-medium text-slate-100">{contact.name}</span>
                  {contact.email && <span className="text-xs text-slate-400">{contact.email}</span>}
                </span>
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                  onClick={() => {
                    onSelectContact?.(contact);
                    onChange(contact.name);
                  }}
                >
                  {mergedStrings.selectContact}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {expressionResult !== null && (
        <div
          className="rounded-md border border-indigo-500/60 bg-indigo-900/20 px-3 py-2 text-xs text-indigo-100"
          aria-live="polite"
        >
          <div className="font-semibold">{mergedStrings.calculatorHeading}</div>
          <div>{mergedStrings.resultLabel(expressionResult)}</div>
        </div>
      )}
    </div>
  );
}

export default MorphingInput;

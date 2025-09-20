import React from "react";
import { createRoot, Root } from "react-dom/client";

type Matcher = string | RegExp;

type RenderResult = {
  container: HTMLElement;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
};

const roots = new Set<Root>();

function matchesText(node: Element, matcher: Matcher): boolean {
  const text = node.textContent ?? "";
  if (typeof matcher === "string") {
    return text.trim() === matcher.trim();
  }
  return matcher.test(text);
}

function queryAllByText(matcher: Matcher) {
  const nodes: Element[] = [];
  document.body.querySelectorAll<HTMLElement>("*").forEach((node) => {
    if (matchesText(node, matcher)) nodes.push(node);
  });
  return nodes;
}

function getByText(matcher: Matcher) {
  const result = queryAllByText(matcher);
  if (result.length === 0) throw new Error(`Unable to find text: ${matcher}`);
  return result[0] as HTMLElement;
}

function getByPlaceholderText(matcher: Matcher) {
  const elements = Array.from(document.body.querySelectorAll<HTMLElement>("input,textarea"));
  const match = elements.find((el) => {
    const placeholder = el.getAttribute("placeholder") || "";
    if (typeof matcher === "string") return placeholder === matcher;
    return matcher.test(placeholder);
  });
  if (!match) throw new Error(`Unable to find placeholder: ${matcher}`);
  return match;
}

function getByLabelText(matcher: Matcher) {
  const ariaMatches = Array.from(document.body.querySelectorAll<HTMLElement>("*")).find((el) => {
    const ariaLabel = el.getAttribute("aria-label");
    if (!ariaLabel) return false;
    if (typeof matcher === "string") return ariaLabel === matcher;
    return matcher.test(ariaLabel);
  });
  if (ariaMatches) return ariaMatches;

  const labels = Array.from(document.body.querySelectorAll<HTMLLabelElement>("label"));
  for (const label of labels) {
    if (matchesText(label, matcher)) {
      const id = label.getAttribute("for");
      if (id) {
        const control = document.getElementById(id);
        if (control) return control as HTMLElement;
      }
      if (label.firstElementChild) return label.firstElementChild as HTMLElement;
    }
  }
  throw new Error(`Unable to find label: ${matcher}`);
}

function getByRole(role: string, { name }: { name?: Matcher } = {}) {
  const elements = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
  for (const el of elements) {
    if (el.getAttribute("role") === role) {
      if (!name) return el;
      const accessible = el.getAttribute("aria-label") || el.textContent || "";
      if (typeof name === "string" ? accessible.includes(name) : name.test(accessible)) {
        return el;
      }
    }
  }
  throw new Error(`Unable to find role: ${role}`);
}

async function waitFor<T>(callback: () => T, { timeout = 1000, interval = 25 } = {}): Promise<T> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return callback();
    } catch (error) {
      if (Date.now() - start > timeout) throw error;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}

function findByText(matcher: Matcher) {
  return waitFor(() => getByText(matcher));
}

function findByLabelText(matcher: Matcher) {
  return waitFor(() => getByLabelText(matcher));
}

function findByRole(role: string, options?: { name?: Matcher }) {
  return waitFor(() => getByRole(role, options));
}

export function render(ui: React.ReactElement): RenderResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.add(root);
  root.render(ui);

  return {
    container,
    rerender(next) {
      root.render(next);
    },
    unmount() {
      root.unmount();
      roots.delete(root);
      container.remove();
    },
  };
}

export async function cleanup() {
  roots.forEach((root) => root.unmount());
  roots.clear();
  document.body.innerHTML = "";
}

export const fireEvent = {
  click(element: Element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  },
  change(element: Element, init: { target?: { value?: any } } = {}) {
    const target = element as HTMLInputElement;
    if (init.target && "value" in init.target) {
      target.value = init.target.value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  },
  keyDown(element: Element, init: KeyboardEventInit) {
    element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
  },
  keyUp(element: Element, init: KeyboardEventInit) {
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true, ...init }));
  },
};

export const screen = {
  getByText,
  findByText,
  getByLabelText,
  findByLabelText,
  getByRole,
  findByRole,
  getByPlaceholderText,
};

export { waitFor };

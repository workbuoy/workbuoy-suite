import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act as reactAct } from "react";

type Matcher = string | RegExp;

type RenderResult = {
  container: HTMLElement;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
};

const roots = new Set<Root>();
const containers = new Map<Root, HTMLElement>();

function act(callback: () => void | Promise<void>) {
  return reactAct(callback);
}

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

function getAllByText(matcher: Matcher) {
  const result = queryAllByText(matcher);
  if (result.length === 0) throw new Error(`Unable to find text: ${matcher}`);
  return result as HTMLElement[];
}

function getByText(matcher: Matcher) {
  return getAllByText(matcher)[0];
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

const implicitRoles: Record<string, string> = {
  button: "button",
  summary: "button",
  form: "form",
  dialog: "dialog",
  table: "table",
  thead: "rowgroup",
  tbody: "rowgroup",
  tr: "row",
  th: "columnheader",
  td: "cell",
  ul: "list",
  ol: "list",
  li: "listitem",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  section: "region",
};

function matchesRole(element: HTMLElement, role: string): boolean {
  const explicit = element.getAttribute("role");
  if (explicit) return explicit === role;
  const tag = element.tagName.toLowerCase();
  const implicit = implicitRoles[tag];
  if (!implicit) return false;
  if (role === "heading") {
    return implicit === "heading" && /^h[1-6]$/.test(tag);
  }
  return implicit === role;
}

function getByRole(role: string, { name }: { name?: Matcher } = {}) {
  const elements = Array.from(document.body.querySelectorAll<HTMLElement>("*"));
  for (const el of elements) {
    if (!matchesRole(el, role)) continue;
    if (!name) return el;
    const labelledBy = el.getAttribute("aria-labelledby");
    let accessible = el.getAttribute("aria-label") || el.textContent || "";
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) accessible = labelElement.textContent || accessible;
    }
    if (typeof name === "string" ? accessible.includes(name) : name.test(accessible)) {
      return el;
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

function findAllByText(matcher: Matcher) {
  return waitFor(() => getAllByText(matcher));
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
  containers.set(root, container);
  act(() => {
    root.render(ui);
  });

  return {
    container,
    rerender(next) {
      act(() => {
        root.render(next);
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      roots.delete(root);
      containers.delete(root);
      container.remove();
    },
  };
}

export async function cleanup() {
  roots.forEach((root) => {
    act(() => {
      root.unmount();
    });
  });
  roots.clear();
  containers.forEach((container) => {
    if (container.parentNode) container.parentNode.removeChild(container);
  });
  containers.clear();
  document.body.innerHTML = "";
}

export const fireEvent = {
  click(element: Element) {
    return act(async () => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
  },
  change(element: Element, init: { target?: { value?: any } } = {}) {
    return act(async () => {
      const target = element as HTMLInputElement;
      if (init.target && "value" in init.target) {
        target.value = init.target.value;
      }
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  },
  keyDown(element: Element, init: KeyboardEventInit) {
    return act(async () => {
      element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
    });
  },
  keyUp(element: Element, init: KeyboardEventInit) {
    return act(async () => {
      element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true, ...init }));
    });
  },
};

export const screen = {
  getByText,
  getAllByText,
  findByText,
  findAllByText,
  getByLabelText,
  findByLabelText,
  getByRole,
  findByRole,
  getByPlaceholderText,
};

export { waitFor };
export { act };

// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

class SimpleEvent implements Event {
  readonly bubbles: boolean;
  cancelable: boolean;
  readonly composed: boolean;
  defaultPrevented = false;
  eventPhase = 0;
  readonly type: string;
  timeStamp = Date.now();
  isTrusted = false;
  target: EventTarget | null = null;
  currentTarget: EventTarget | null = null;
  composedPath(): EventTarget[] {
    const path: EventTarget[] = [];
    let node = this.target as SimpleNode | null;
    while (node) {
      path.push(node);
      node = (node as SimpleNode).parentNode;
    }
    if (this.target && (this.target as any).defaultView) {
      path.push((this.target as any).defaultView);
    }
    return path;
  }
  private propagationStopped = false;
  private immediatePropagationStopped = false;

  constructor(type: string, init: EventInit = {}) {
    this.type = type;
    this.bubbles = !!init.bubbles;
    this.cancelable = !!init.cancelable;
    this.composed = !!init.composed;
  }

  stopPropagation(): void {
    this.propagationStopped = true;
  }

  stopImmediatePropagation(): void {
    this.propagationStopped = true;
    this.immediatePropagationStopped = true;
  }

  get propagationStoppedFlag(): boolean {
    return this.propagationStopped;
  }

  get immediatePropagationStoppedFlag(): boolean {
    return this.immediatePropagationStopped;
  }

  preventDefault(): void {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
    (this as any).type = type;
    (this as any).bubbles = !!bubbles;
    this.cancelable = !!cancelable;
  }
}

class SimpleKeyboardEvent extends SimpleEvent implements KeyboardEvent {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly key: string;
  readonly code: string;
  readonly repeat: boolean;
  readonly isComposing = false;
  readonly location = 0;
  readonly charCode = 0;
  readonly keyCode = 0;
  readonly which = 0;

  constructor(type: string, init: KeyboardEventInit = {}) {
    super(type, init);
    this.key = init.key ?? "";
    this.code = init.code ?? "";
    this.altKey = !!init.altKey;
    this.ctrlKey = !!init.ctrlKey;
    this.metaKey = !!init.metaKey;
    this.shiftKey = !!init.shiftKey;
    this.repeat = !!init.repeat;
  }

  getModifierState(_keyArg: string): boolean {
    return false;
  }

  initKeyboardEvent(): void {
    /* noop */
  }
}

class SimpleMouseEvent extends SimpleEvent implements MouseEvent {
  readonly altKey: boolean;
  readonly button: number;
  readonly buttons: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly movementX = 0;
  readonly movementY = 0;
  readonly offsetX = 0;
  readonly offsetY = 0;
  readonly pageX: number;
  readonly pageY: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly shiftKey: boolean;
  readonly detail: number;

  constructor(type: string, init: MouseEventInit = {}) {
    super(type, init);
    this.altKey = !!init.altKey;
    this.ctrlKey = !!init.ctrlKey;
    this.metaKey = !!init.metaKey;
    this.shiftKey = !!init.shiftKey;
    this.button = init.button ?? 0;
    this.buttons = init.buttons ?? 0;
    this.clientX = init.clientX ?? 0;
    this.clientY = init.clientY ?? 0;
    this.pageX = init.pageX ?? this.clientX;
    this.pageY = init.pageY ?? this.clientY;
    this.screenX = init.screenX ?? this.clientX;
    this.screenY = init.screenY ?? this.clientY;
    this.detail = init.detail ?? 0;
  }

  getModifierState(_keyArg: string): boolean {
    return false;
  }

  relatedTarget: EventTarget | null = null;
}

class SimpleDOMTokenList {
  private tokens = new Set<string>();
  constructor(initial?: string) {
    if (initial) {
      initial
        .split(/\s+/)
        .filter(Boolean)
        .forEach((token) => this.tokens.add(token));
    }
  }

  get value(): string {
    return Array.from(this.tokens).join(" ");
  }

  set value(value: string) {
    this.tokens.clear();
    value
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => this.tokens.add(token));
  }

  add(...tokens: string[]): void {
    tokens.forEach((token) => this.tokens.add(token));
  }

  remove(...tokens: string[]): void {
    tokens.forEach((token) => this.tokens.delete(token));
  }

  toggle(token: string, force?: boolean): boolean {
    if (force === true) {
      this.tokens.add(token);
      return true;
    }
    if (force === false) {
      this.tokens.delete(token);
      return false;
    }
    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      return false;
    }
    this.tokens.add(token);
    return true;
  }

  contains(token: string): boolean {
    return this.tokens.has(token);
  }

  forEach(callback: (token: string) => void): void {
    this.tokens.forEach(callback);
  }

  toString(): string {
    return this.value;
  }
}

class SimpleEventTarget implements EventTarget {
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener) return;
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener) return;
    const set = this.listeners.get(type);
    if (!set) return;
    set.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    const simple = event as SimpleEvent;
    if (!simple.target) {
      simple.target = this as unknown as EventTarget;
    }
    simple.currentTarget = this as unknown as EventTarget;

    const set = this.listeners.get(simple.type);
    if (set) {
      for (const listener of Array.from(set)) {
        if (simple instanceof SimpleEvent && simple.immediatePropagationStoppedFlag) {
          break;
        }
        if (typeof listener === "function") {
          listener.call(this, event);
        } else {
          listener.handleEvent(event);
        }
      }
    }

    if (simple instanceof SimpleEvent && simple.propagationStoppedFlag) {
      return !simple.defaultPrevented;
    }

    if (simple.bubbles) {
      const parent = (this as any).parentNode as SimpleNode | null;
      if (parent) {
        return parent.dispatchEvent(event);
      }
      const doc = (this as any).ownerDocument as SimpleDocument | undefined;
      if (doc && doc.defaultView && event !== doc.defaultView) {
        return doc.defaultView.dispatchEvent(event);
      }
    }

    return !simple.defaultPrevented;
  }
}

class SimpleNode extends SimpleEventTarget implements Node {
  readonly childNodes: Node[] = [];
  parentNode: SimpleNode | null = null;
  ownerDocument: SimpleDocument;
  readonly nodeType: number;
  readonly nodeName: string;

  constructor(ownerDocument: SimpleDocument, type: number, name: string) {
    super();
    this.ownerDocument = ownerDocument;
    this.nodeType = type;
    this.nodeName = name;
  }

  get parentElement(): Element | null {
    return this.parentNode instanceof SimpleElement ? (this.parentNode as any) : null;
  }

  get previousSibling(): Node | null {
    if (!this.parentNode) return null;
    const idx = this.parentNode.childNodes.indexOf(this);
    return idx > 0 ? this.parentNode.childNodes[idx - 1] : null;
  }

  get nextSibling(): Node | null {
    if (!this.parentNode) return null;
    const idx = this.parentNode.childNodes.indexOf(this);
    return idx >= 0 && idx < this.parentNode.childNodes.length - 1
      ? this.parentNode.childNodes[idx + 1]
      : null;
  }

  appendChild<T extends Node>(node: T): T {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    (node as SimpleNode).parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  removeChild<T extends Node>(node: T): T {
    const idx = this.childNodes.indexOf(node);
    if (idx === -1) throw new Error("Node not a child");
    this.childNodes.splice(idx, 1);
    (node as SimpleNode).parentNode = null;
    return node;
  }

  insertBefore<T extends Node>(node: T, reference: Node | null): T {
    if (!reference) {
      return this.appendChild(node);
    }
    const idx = this.childNodes.indexOf(reference);
    if (idx === -1) {
      return this.appendChild(node);
    }
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
    (node as SimpleNode).parentNode = this;
    this.childNodes.splice(idx, 0, node);
    return node;
  }

  replaceChild<T extends Node>(node: Node, oldChild: T): T {
    const idx = this.childNodes.indexOf(oldChild);
    if (idx === -1) throw new Error("Node not a child");
    if ((node as SimpleNode).parentNode) {
      (node as SimpleNode).parentNode.removeChild(node as SimpleNode);
    }
    (node as SimpleNode).parentNode = this;
    this.childNodes[idx] = node;
    (oldChild as SimpleNode).parentNode = null;
    return oldChild;
  }

  cloneNode(deep?: boolean): Node {
    if (this.nodeType === NODE_TYPES.TEXT_NODE) {
      return new SimpleText(this.ownerDocument, (this as any).data);
    }
    if (this.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) {
      const fragment = new SimpleDocumentFragment(this.ownerDocument);
      if (deep) {
        this.childNodes.forEach((child) => fragment.appendChild((child as SimpleNode).cloneNode(true)));
      }
      return fragment;
    }
    if (this instanceof SimpleElement) {
      const clone = this.ownerDocument.createElement(this.tagName.toLowerCase());
      this.attributes.forEach((value, key) => clone.setAttribute(key, value));
      if (deep) {
        this.childNodes.forEach((child) => clone.appendChild((child as SimpleNode).cloneNode(true)));
      }
      return clone;
    }
    return new SimpleNode(this.ownerDocument, this.nodeType, this.nodeName);
  }

  get textContent(): string | null {
    if (this.nodeType === NODE_TYPES.TEXT_NODE) {
      return (this as SimpleText).data;
    }
    return this.childNodes.map((child) => (child as SimpleNode).textContent ?? "").join("");
  }

  set textContent(value: string | null) {
    this.childNodes.splice(0, this.childNodes.length);
    if (value) {
      this.appendChild(this.ownerDocument.createTextNode(value));
    }
  }

  hasChildNodes(): boolean {
    return this.childNodes.length > 0;
  }

  contains(node: Node): boolean {
    if (node === this) return true;
    for (const child of this.childNodes) {
      if ((child as SimpleNode).contains(node)) {
        return true;
      }
    }
    return false;
  }

  normalize(): void {
    /* noop */
  }

  get firstChild(): Node | null {
    return this.childNodes[0] ?? null;
  }

  get lastChild(): Node | null {
    return this.childNodes[this.childNodes.length - 1] ?? null;
  }

  lookupPrefix(): string | null {
    return null;
  }

  lookupNamespaceURI(): string | null {
    return null;
  }

  isEqualNode(otherNode: Node | null): boolean {
    return this === otherNode;
  }

  isSameNode(otherNode: Node | null): boolean {
    return this === otherNode;
  }

  compareDocumentPosition(other: Node): number {
    if (this === other) return 0;
    return 1;
  }

  get nodeValue(): string | null {
    return this.textContent;
  }

  set nodeValue(value: string | null) {
    this.textContent = value;
  }

  get ownerDocumentValue(): Document {
    return this.ownerDocument;
  }

  get baseURI(): string {
    return this.ownerDocument.baseURI;
  }
}

class SimpleText extends SimpleNode implements Text {
  data: string;
  constructor(ownerDocument: SimpleDocument, data: string) {
    super(ownerDocument, NODE_TYPES.TEXT_NODE, "#text");
    this.data = data;
  }

  splitText(offset: number): Text {
    const first = this.data.slice(0, offset);
    const second = this.data.slice(offset);
    this.data = first;
    const newNode = new SimpleText(this.ownerDocument, second);
    if (this.parentNode) {
      this.parentNode.insertBefore(newNode, this.nextSibling);
    }
    return newNode;
  }

  get wholeText(): string {
    return this.data;
  }

  get length(): number {
    return this.data.length;
  }

  substringData(offset: number, count: number): string {
    return this.data.substring(offset, offset + count);
  }

  appendData(data: string): void {
    this.data += data;
  }

  insertData(offset: number, data: string): void {
    this.data = this.data.slice(0, offset) + data + this.data.slice(offset);
  }

  deleteData(offset: number, count: number): void {
    this.data = this.data.slice(0, offset) + this.data.slice(offset + count);
  }

  replaceData(offset: number, count: number, data: string): void {
    this.deleteData(offset, count);
    this.insertData(offset, data);
  }

  get textContent(): string {
    return this.data;
  }

  set textContent(value: string) {
    this.data = value;
  }
}

class SimpleDocumentFragment extends SimpleNode implements DocumentFragment {
  constructor(ownerDocument: SimpleDocument) {
    super(ownerDocument, NODE_TYPES.DOCUMENT_FRAGMENT_NODE, "#document-fragment");
  }
}

type AttributeMap = Map<string, string>;

class SimpleElement extends SimpleNode implements Element {
  readonly attributes: AttributeMap = new Map();
  readonly classList = new SimpleDOMTokenList();
  style: Record<string, string> & CSSStyleDeclaration;
  tabIndex = 0;
  namespaceURI: string | null = null;
  slot = "";

  constructor(ownerDocument: SimpleDocument, tagName: string) {
    super(ownerDocument, NODE_TYPES.ELEMENT_NODE, tagName.toUpperCase());
    this.style = new Proxy({} as Record<string, string>, {
      get: (target, prop) => target[prop as string] ?? "",
      set: (target, prop, value) => {
        target[prop as string] = String(value);
        return true;
      },
    }) as CSSStyleDeclaration & Record<string, string>;
  }

  get tagName(): string {
    return this.nodeName;
  }

  get id(): string {
    return this.getAttribute("id") ?? "";
  }

  set id(value: string) {
    this.setAttribute("id", value);
  }

  get className(): string {
    return this.classList.toString();
  }

  set className(value: string) {
    this.classList.value = value;
  }

  get innerHTML(): string {
    return this.childNodes.map((child) => serializeNode(child as SimpleNode)).join("");
  }

  set innerHTML(html: string) {
    this.childNodes.splice(0, this.childNodes.length);
    if (html.trim()) {
      const text = this.ownerDocument.createTextNode(html);
      this.appendChild(text);
    }
  }

  get outerHTML(): string {
    return serializeNode(this);
  }

  get children(): HTMLCollection {
    const elements = this.childNodes.filter((node) => node.nodeType === NODE_TYPES.ELEMENT_NODE) as Element[];
    return {
      length: elements.length,
      item: (index: number) => elements[index] ?? null,
      [Symbol.iterator]() {
        return elements[Symbol.iterator]();
      },
    } as unknown as HTMLCollection;
  }

  get firstElementChild(): Element | null {
    return this.children.item(0);
  }

  get lastElementChild(): Element | null {
    return this.children.item(this.children.length - 1);
  }

  getAttribute(name: string): string | null {
    if (name === "class") return this.classList.value || null;
    return this.attributes.get(name) ?? null;
  }

  getAttributeNames(): string[] {
    const names = new Set<string>();
    this.attributes.forEach((_value, key) => names.add(key));
    if (this.classList.value) {
      names.add("class");
    }
    return Array.from(names);
  }

  setAttribute(name: string, value: string): void {
    if (name === "class") {
      this.classList.value = value;
      return;
    }
    this.attributes.set(name, String(value));
    if (name === "id" && this.ownerDocument) {
      this.ownerDocument.registerElementId(this);
    }
  }

  removeAttribute(name: string): void {
    if (name === "class") {
      this.classList.value = "";
      return;
    }
    this.attributes.delete(name);
  }

  hasAttribute(name: string): boolean {
    if (name === "class") return this.classList.value.length > 0;
    return this.attributes.has(name);
  }

  matches(selector: string): boolean {
    const selectors = selector.split(",").map((s) => s.trim()).filter(Boolean);
    return selectors.some((sel) => matchSimpleSelector(this, sel));
  }

  closest(selector: string): Element | null {
    let current: SimpleNode | null = this;
    while (current) {
      if (current instanceof SimpleElement && current.matches(selector)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  querySelector(selector: string): Element | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): Element[] {
    const matches: Element[] = [];
    const selectors = selector.split(",").map((s) => s.trim()).filter(Boolean);
    traverse(this, (node) => {
      if (node instanceof SimpleElement) {
        if (selectors.length === 0) {
          matches.push(node);
          return;
        }
        if (selectors.some((sel) => matchSimpleSelector(node, sel))) {
          matches.push(node);
        }
      }
    });
    return matches;
  }

  getBoundingClientRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => "",
    } as DOMRect;
  }

  focus(): void {
    this.ownerDocument.setActiveElement(this as unknown as HTMLElement);
    this.dispatchEvent(new SimpleEvent("focus", { bubbles: false }));
  }

  blur(): void {
    if (this.ownerDocument.activeElement === this) {
      this.ownerDocument.setActiveElement(null);
    }
    this.dispatchEvent(new SimpleEvent("blur", { bubbles: false }));
  }

  click(): void {
    this.dispatchEvent(new SimpleMouseEvent("click", { bubbles: true }));
  }

  scrollIntoView(): void {
    /* noop */
  }
}

class SimpleHTMLElement extends SimpleElement implements HTMLElement {
  title = "";
  lang = "";
  dir = "";
  hidden = false;
  dataset: Record<string, string> = {};
  accessKey = "";
  draggable = false;
  spellcheck = true;
  innerText = "";

  constructor(ownerDocument: SimpleDocument, tagName: string) {
    super(ownerDocument, tagName);
  }

  get offsetParent(): Element | null {
    return this.parentElement;
  }

  get offsetTop(): number {
    return 0;
  }

  get offsetLeft(): number {
    return 0;
  }

  get offsetHeight(): number {
    return 0;
  }

  get offsetWidth(): number {
    return 0;
  }

  attachShadow(_init: ShadowRootInit): ShadowRoot {
    throw new Error("Shadow DOM not supported in test environment");
  }

  get style(): CSSStyleDeclaration & Record<string, string> {
    return super.style;
  }
}

class SimpleHTMLInputElement extends SimpleHTMLElement implements HTMLInputElement {
  value = "";
  type = "text";
  checked = false;
  disabled = false;
  placeholder = "";
  name = "";
  required = false;
  readOnly = false;
  defaultValue = "";
  files: FileList | null = null;
  accept = "";
  allowdirs = false;
  autocomplete = "";
  autofocus = false;
  capture: string | boolean = false;
  inputMode = "";
  max = "";
  maxLength = -1;
  min = "";
  minLength = -1;
  multiple = false;
  pattern = "";
  size = 0;
  src = "";
  step = "";
  defaultChecked = false;
  formAction = "";
  formEnctype = "";
  formMethod = "";
  formNoValidate = false;
  formTarget = "";

  constructor(ownerDocument: SimpleDocument, tagName: string) {
    super(ownerDocument, tagName);
  }

  setAttribute(name: string, value: string): void {
    super.setAttribute(name, value);
    if (name === "value") {
      this.value = value;
    }
    if (name === "type") {
      this.type = value;
    }
    if (name === "placeholder") {
      this.placeholder = value;
    }
  }

  select(): void {
    /* noop */
  }

  setRangeText(): void {
    /* noop */
  }

  setSelectionRange(): void {
    /* noop */
  }

  stepDown(): void {
    /* noop */
  }

  stepUp(): void {
    /* noop */
  }

  checkValidity(): boolean {
    return true;
  }

  reportValidity(): boolean {
    return true;
  }

  setCustomValidity(): void {
    /* noop */
  }

  get labels(): NodeListOf<HTMLLabelElement> {
    return [] as unknown as NodeListOf<HTMLLabelElement>;
  }
}

class SimpleHTMLTextAreaElement extends SimpleHTMLElement implements HTMLTextAreaElement {
  value = "";
  defaultValue = "";
  placeholder = "";
  readOnly = false;
  required = false;
  selectionStart: number | null = null;
  selectionEnd: number | null = null;
  selectionDirection: "forward" | "backward" | "none" | null = null;
  textLength = 0;
  cols = 0;
  rows = 0;
  wrap = "";
  maxLength = -1;
  minLength = -1;

  setAttribute(name: string, value: string): void {
    super.setAttribute(name, value);
    if (name === "value") {
      this.value = value;
    }
    if (name === "placeholder") {
      this.placeholder = value;
    }
  }

  select(): void {}
  setRangeText(): void {}
  setSelectionRange(): void {}
  checkValidity(): boolean { return true; }
  reportValidity(): boolean { return true; }
  setCustomValidity(): void {}
  get labels(): NodeListOf<HTMLLabelElement> { return [] as any; }
}

class SimpleHTMLSelectElement extends SimpleHTMLElement implements HTMLSelectElement {
  value = "";
  selectedIndex = -1;
  length = 0;
  disabled = false;
  multiple = false;
  name = "";
  size = 0;

  options = [] as any;
  selectedOptions = [] as any;

  add(): void {}
  remove(): void {}
  item(): any { return null; }
  namedItem(): any { return null; }
  checkValidity(): boolean { return true; }
  reportValidity(): boolean { return true; }
  setCustomValidity(): void {}
}

class SimpleDocument extends SimpleNode implements Document {
  readonly nodeType = NODE_TYPES.DOCUMENT_NODE;
  readonly nodeName = "#document";
  readonly documentElement: SimpleHTMLElement;
  readonly body: SimpleHTMLElement;
  readonly head: SimpleHTMLElement;
  readonly implementation: DOMImplementation;
  private elementIds = new Map<string, SimpleElement>();
  defaultView!: SimpleWindow;
  baseURI = "http://localhost";
  activeElement: Element | null = null;

  constructor() {
    super({} as SimpleDocument, NODE_TYPES.DOCUMENT_NODE, "#document");
    (this as any).ownerDocument = this;
    this.implementation = {
      hasFeature: () => true,
      createDocumentType: () => null as any,
      createDocument: () => new SimpleDocument(),
      createHTMLDocument: () => new SimpleDocument(),
    } as DOMImplementation;
    this.documentElement = new SimpleHTMLElement(this, "html");
    this.head = new SimpleHTMLElement(this, "head");
    this.body = new SimpleHTMLElement(this, "body");
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    super.appendChild(this.documentElement);
  }

  appendChild<T extends Node>(node: T): T {
    if (node === this.documentElement) return node;
    return this.documentElement.appendChild(node);
  }

  createElement(tagName: string): HTMLElement {
    return this.createElementNS(null, tagName);
  }

  createElementNS(_ns: string | null, qualifiedName: string): Element {
    const tag = qualifiedName.toLowerCase();
    if (tag === "input") return new SimpleHTMLInputElement(this, tag);
    if (tag === "textarea") return new SimpleHTMLTextAreaElement(this, tag);
    if (tag === "select") return new SimpleHTMLSelectElement(this, tag);
    return new SimpleHTMLElement(this, tag);
  }

  createTextNode(data: string): Text {
    return new SimpleText(this, data);
  }

  createDocumentFragment(): DocumentFragment {
    return new SimpleDocumentFragment(this);
  }

  getElementById(id: string): Element | null {
    return this.elementIds.get(id) ?? null;
  }

  registerElementId(element: SimpleElement): void {
    const id = element.getAttribute("id");
    if (id) {
      this.elementIds.set(id, element);
    }
  }

  querySelector(selector: string): Element | null {
    return this.documentElement.querySelector(selector);
  }

  querySelectorAll(selector: string): NodeListOf<Element> {
    const result = this.documentElement.querySelectorAll(selector);
    return {
      length: result.length,
      item: (index: number) => result[index] ?? null,
      [Symbol.iterator]: () => result[Symbol.iterator](),
      forEach: (callback: (value: Element, key: number) => void) =>
        result.forEach((value, index) => callback(value, index)),
      entries: () => result.entries(),
      keys: () => result.keys(),
      values: () => result.values(),
    } as unknown as NodeListOf<Element>;
  }

  getElementsByTagName(tagName: string): HTMLCollectionOf<Element> {
    const lower = tagName.toLowerCase();
    const matches = this.documentElement.querySelectorAll(lower);
    return matches as unknown as HTMLCollectionOf<Element>;
  }

  getElementsByClassName(className: string): HTMLCollectionOf<Element> {
    const matches = this.documentElement.querySelectorAll(`.${className}`);
    return matches as unknown as HTMLCollectionOf<Element>;
  }

  createRange(): Range {
    return {
      setStart: () => {},
      setEnd: () => {},
      getBoundingClientRect: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => "",
      }),
    } as unknown as Range;
  }

  hasFocus(): boolean {
    return !!this.activeElement;
  }

  setActiveElement(element: HTMLElement | null): void {
    this.activeElement = element;
  }

  adoptNode<T extends Node>(node: T): T {
    return node;
  }

  importNode<T extends Node>(node: T, deep?: boolean): T {
    return (node as SimpleNode).cloneNode(deep) as T;
  }

  get readyState(): DocumentReadyState {
    return "complete";
  }

  get visibilityState(): DocumentVisibilityState {
    return "visible";
  }

  get hidden(): boolean {
    return false;
  }

  get scrollingElement(): Element {
    return this.documentElement;
  }
}

function traverse(node: SimpleNode, callback: (node: SimpleNode) => void): void {
  node.childNodes.forEach((child) => {
    callback(child as SimpleNode);
    traverse(child as SimpleNode, callback);
  });
}

function matchSimpleSelector(element: SimpleElement, selector: string): boolean {
  if (!selector || selector === "*") return true;
  const attrRegex = /\[([^\]=]+)(?:=\"?([^\]"]+)\"?)?\]/g;
  const parts = selector.split(/(?=[.#\[])/);
  let tag = selector.match(/^[a-zA-Z0-9_-]+/)?.[0];
  if (tag && tag !== element.tagName.toLowerCase()) {
    return false;
  }
  const classes = selector.match(/\.[^.#\[]+/g) ?? [];
  for (const cls of classes) {
    const token = cls.slice(1);
    if (!element.classList.contains(token)) {
      return false;
    }
  }
  const idMatch = selector.match(/#([^.#\[]+)/);
  if (idMatch && element.id !== idMatch[1]) {
    return false;
  }

  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(selector))) {
    const name = attrMatch[1];
    const value = attrMatch[2];
    if (!element.hasAttribute(name)) {
      return false;
    }
    if (value !== undefined && element.getAttribute(name) !== value) {
      return false;
    }
  }
  return true;
}

class SimpleStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

let animationFrameId = 1;

class SimpleWindow extends SimpleEventTarget implements Window {
  readonly document: SimpleDocument;
  readonly localStorage = new SimpleStorage();
  readonly sessionStorage = new SimpleStorage();
  navigator = { userAgent: "node" } as Navigator;
  readonly performance = { now: () => Date.now() } as Performance;
  readonly origin = "http://localhost";
  readonly location = new URL("http://localhost");
  readonly history = { pushState: () => {}, replaceState: () => {} } as History;
  readonly CustomEvent = SimpleEvent as unknown as typeof CustomEvent;
  readonly Event = SimpleEvent as unknown as typeof Event;
  readonly KeyboardEvent = SimpleKeyboardEvent as unknown as typeof KeyboardEvent;
  readonly MouseEvent = SimpleMouseEvent as unknown as typeof MouseEvent;
  readonly HTMLElement = SimpleHTMLElement as unknown as typeof HTMLElement;
  readonly HTMLInputElement = SimpleHTMLInputElement as unknown as typeof HTMLInputElement;
  readonly HTMLTextAreaElement = SimpleHTMLTextAreaElement as unknown as typeof HTMLTextAreaElement;
  readonly HTMLSelectElement = SimpleHTMLSelectElement as unknown as typeof HTMLSelectElement;
  readonly Element = SimpleElement as unknown as typeof Element;
  readonly Node = SimpleNode as unknown as typeof Node;
  readonly Text = SimpleText as unknown as typeof Text;
  readonly Document = SimpleDocument as unknown as typeof Document;
  readonly DOMTokenList = SimpleDOMTokenList as unknown as typeof DOMTokenList;
  readonly EventTarget = SimpleEventTarget as unknown as typeof EventTarget;
  readonly documentFragment = SimpleDocumentFragment as unknown as typeof DocumentFragment;
  readonly requestAnimationFrame = (callback: FrameRequestCallback) => {
    const id = animationFrameId++;
    setTimeout(() => callback(Date.now()), 16);
    return id;
  };
  readonly cancelAnimationFrame = (_id: number) => {};
  readonly getComputedStyle = () => ({ getPropertyValue: () => "" }) as CSSStyleDeclaration;
  readonly matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
  readonly ResizeObserver = class {
    constructor(_cb: ResizeObserverCallback) {}
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;

  constructor(document: SimpleDocument) {
    super();
    this.document = document;
    document.defaultView = this;
    // Ensure these constructors are also available as window properties (some libs expect it)
    (this as any).Node = SimpleNode;
    (this as any).HTMLElement = SimpleHTMLElement;
    (this as any).Element = SimpleElement;
    (this as any).Document = SimpleDocument;
    (this as any).Text = SimpleText;
  }

  get window(): this {
    return this;
  }

  alert(): void {}
  confirm(): boolean { return true; }
  prompt(): string | null { return null; }
  open(): Window | null { return null; }
  close(): void {}
  focus(): void {}
  blur(): void {}
}

function serializeNode(node: SimpleNode): string {
  if (node.nodeType === NODE_TYPES.TEXT_NODE) {
    return escapeHtml((node as SimpleText).data);
  }
  if (node instanceof SimpleElement) {
    const attrs = node
      .getAttributeNames()
      .map((name) => {
        const value = node.getAttribute(name);
        if (value === null || value === "") return name;
        return `${name}="${escapeHtml(value)}"`;
      })
      .join(" ");
    const children = node.childNodes.map((child) => serializeNode(child as SimpleNode)).join("");
    const open = attrs ? `<${node.tagName.toLowerCase()} ${attrs}>` : `<${node.tagName.toLowerCase()}>`;
    return `${open}${children}</${node.tagName.toLowerCase()}>`;
  }
  if (node.nodeType === NODE_TYPES.DOCUMENT_FRAGMENT_NODE) {
    return node.childNodes.map((child) => serializeNode(child as SimpleNode)).join("");
  }
  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function installDom() {
  if (typeof window !== "undefined" && (window as any).document) {
    return;
  }
  const document = new SimpleDocument();
  const win = new SimpleWindow(document);

  const define = (key: string, value: unknown) => {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };

  define("window", win);
  define("self", win);
  define("document", document);
  define("navigator", win.navigator);
  define("localStorage", win.localStorage);
  define("sessionStorage", win.sessionStorage);
  define("Event", win.Event);
  define("KeyboardEvent", win.KeyboardEvent);
  define("MouseEvent", win.MouseEvent);
  define("HTMLElement", win.HTMLElement);
  define("HTMLInputElement", win.HTMLInputElement);
  define("HTMLTextAreaElement", win.HTMLTextAreaElement);
  define("HTMLSelectElement", win.HTMLSelectElement);
  define("Element", win.Element);
  define("Node", win.Node);
  define("Text", win.Text);
  define("Document", win.Document);
  define("DOMTokenList", win.DOMTokenList);
  define("CustomEvent", win.CustomEvent);
  define("getComputedStyle", win.getComputedStyle);
  define("requestAnimationFrame", win.requestAnimationFrame);
  define("cancelAnimationFrame", win.cancelAnimationFrame);
}

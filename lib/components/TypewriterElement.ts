const HIDDEN_CLASS = 'sm-h';
const PAUSE_CLASS = 'sm-pause';

function breakText(textNode: Node, parent: Node, className: string): HTMLSpanElement[] {
  const outerSpan = document.createElement('span');
  parent.replaceChild(outerSpan, textNode);
  const text = textNode.textContent ?? '';

  let whitespace = '';

  const splitStr: string[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]!;

    if (/\s/.test(char)) {
      whitespace += char;
    } else {
      if (whitespace) {
        splitStr.push(whitespace);
        whitespace = '';
      }

      splitStr.push(char);
    }
  }

  if (whitespace) {
    splitStr.push(whitespace);
  }

  return splitStr.map((str) => {
    const rVal = new HTMLSpanElement();
    rVal.className = className;
    rVal.textContent = str;

    return rVal;
  });
}

function breakTextNodes(node: Node, parent: Node, textClassName: string): HTMLSpanElement[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return breakText(node, parent, textClassName);
  }
  const rVal: HTMLSpanElement[] = [];

  node.childNodes.forEach((child) => (
    rVal.push(...breakTextNodes(child, node, textClassName))
  ));

  return rVal;
}

export default class TypewriterElement extends HTMLDivElement {
  #spans: (HTMLElement | null)[];

  #progress = 0;

  #intervalSeconds: number;

  #paused: boolean;

  #intervalId: number | null = null;

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });

    this.#spans = [];

    this.childNodes.forEach((node) => {
      const clone = node.cloneNode(true);
      root.appendChild(clone);
      this.#spans.push(...breakTextNodes(clone, root, HIDDEN_CLASS));
    });

    this.#paused = !!this.dataset['paused'];
    this.#intervalSeconds = Number.parseFloat(this.dataset['interval'] ?? '0.125');
  }

  static timedNext(e: TypewriterElement) {
    e.next();
    if (!e.done && (e.#intervalId !== null)) {
      clearInterval(e.#intervalId);
      e.#intervalId = null;
    }
  }

  private private_disable() {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  private private_enable() {
    if ((this.#intervalId === null) && !this.#paused && this.isConnected && !this.done) {
      this.#intervalId = setInterval(
        TypewriterElement.timedNext,
        this.#intervalSeconds,
        this,
      );
    }
  }

  next() {
    if (!this.done) {
      this.#spans[this.#progress]!.classList.remove(HIDDEN_CLASS);
      this.#progress += 1;

      while (this.#spans[this.#progress]!.classList.contains(PAUSE_CLASS)) {
        this.#progress += 1;
        this.#paused = true;
      }
    } else {
      this.private_disable();
    }
  }

  pause() {
    this.#paused = true;
    this.private_disable();
  }

  resume() {
    this.#paused = false;
    this.private_enable();
  }

  reset() {
    for (let i = this.#progress - 1; i >= 0; i -= 1) {
      this.#spans[i]!.classList.add(HIDDEN_CLASS);
    }
  }

  finish() {
    for (let i = this.#progress; i < this.#spans.length; i += 1) {
      this.#spans[i]!.classList.remove(HIDDEN_CLASS);
    }

    this.#progress = this.#spans.length;
    this.private_disable();
  }

  get done() {
    return this.#progress >= this.#spans.length;
  }

  connectedCallback() {
    this.private_enable();
  }

  disconnectedCallback() {
    this.private_disable();
  }
}

export function enableTypewriter() {
  customElements.define('typewriter', TypewriterElement);
}

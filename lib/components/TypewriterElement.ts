const HIDDEN_CLASS = 'sm-h';
const PAUSE_CLASS = 'sm-pause';

export class TypewriterElement extends HTMLDivElement {

    #spans: (HTMLElement | null)[];
    #progress = 0;
    #intervalSeconds: number;
    #paused: boolean;

    #intervalId: number | null = null;

    constructor() {
        super();

        const root = this.attachShadow({mode: 'open'});

        const duplicates: Node[] = []; 

        this.#spans = [];

        this.childNodes.forEach(node => {
            var clone = node.cloneNode(true);
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

    private _disable() {
        if (this.#intervalId !== null){
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }
    }

    private _enable() {
        if ((this.#intervalId === null) && !this.#paused && this.isConnected && !this.done) {
            this.#intervalId = setInterval(
                TypewriterElement.timedNext, 
                this.#intervalSeconds, 
            this);
        }
    }

    next() {
        if (!this.done){
            this.#spans[this.#progress]!.classList.remove(HIDDEN_CLASS);
            this.#progress += 1;

            while (this.#spans[this.#progress]!.classList.contains(PAUSE_CLASS)) {
                this.#progress += 1;
                this.#paused = true;
            }
        } else {
            this._disable();
        }
    }

    pause() {
        this.#paused = true;
        this._disable();
    }

    resume() {
        this.#paused = false;
        this._enable();
    }

    reset() {
        for (let i = this.#progress - 1; i >= 0; i--){
            this.#spans[i]!.classList.add(HIDDEN_CLASS);
        }
    }

    finish() {
        for (let i = this.#progress; i < this.#spans.length; i++){
            this.#spans[i]!.classList.remove(HIDDEN_CLASS);
        }

        this.#progress = this.#spans.length;
        this._disable();
    }

    get done() {
        return this.#progress >= this.#spans.length;
    }

    connectedCallback() {
        this._enable();
    }

    disconnectedCallback() {
        this._disable();
    }
}

function breakTextNodes(node: Node, parent: Node, textClassName: string): HTMLSpanElement[] {
    if (node.nodeType === Node.TEXT_NODE) {
        return breakText(node, parent, textClassName);
    } else {
        const rVal: HTMLSpanElement[] = [];

        node.childNodes.forEach(child => (
            rVal.push(...breakTextNodes(child, node, textClassName))
        ));

        return rVal;
    }
}

function breakText(textNode: Node, parent: Node, className: string): HTMLSpanElement[] {
    const outerSpan = document.createElement('span');
    parent.replaceChild(outerSpan, textNode);
    const text = textNode.textContent ?? '';

    let whitespace = '';

    let splitStr: string[] = [];

    for (let i = 0; i < text.length; i++) {
        const char = text[i]!;

        if (/\s/.test(char)) {
            whitespace += char;
        }else{
            if (whitespace){
                splitStr.push(whitespace);
                whitespace = '';
            }

            splitStr.push(char);
        }
    }

    if (whitespace) {
        splitStr.push(whitespace);
    }

    return splitStr.map(str => {
        const rVal = new HTMLSpanElement();
        rVal.className = className;
        rVal.textContent = str;
    
        return rVal;
    });
}

export function enableTypewriter() {
    customElements.define('typewriter', TypewriterElement);
}

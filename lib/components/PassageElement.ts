import { Passage } from "../Passage";

export class MarkdownElement extends HTMLSpanElement {
    public constructor() {
        super();

        for (let i = 0; i < this.childNodes.length; i++){
            const node = this.childNodes[i]!;
            if (node.nodeType == this.TEXT_NODE){
                const span = document.createElement('span');
                span.className = 'sm-md';
                span.innerHTML = Passage.renderMarkdown(node.textContent || '');

                this.replaceChild(span, node);
            }
        }
    }
}

export function setupMarkdown() {
    customElements.define('markdown', MarkdownElement);
}


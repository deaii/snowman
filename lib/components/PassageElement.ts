import renderMarkdown from '../util/renderMarkdown';

export default class MarkdownElement extends HTMLSpanElement {
  public constructor() {
    super();

    for (let i = 0; i < this.childNodes.length; i += 1) {
      const node = this.childNodes[i]!;
      if (node.nodeType === this.TEXT_NODE) {
        const span = document.createElement('span');
        span.className = 'sm-md';
        span.innerHTML = renderMarkdown(node.textContent || '');
        this.replaceChild(span, node);
      }
    }
  }
}

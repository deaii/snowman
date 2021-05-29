import { onPassageShown } from '../events';
import renderPassage from '../util/renderPassage';

export class WidgetElement extends HTMLDivElement {
    #passageName: string;

    #source: string;

    #priority: number;

    #passageDiv?: HTMLDivElement;

    #sourceDiv?: HTMLDivElement;

    declare shadowRoot: ShadowRoot;

    constructor() {
      super();

      this.attachShadow({ mode: 'open' });

      this.#passageName = this.getAttribute('passage') ?? '';
      this.#priority = Number.parseFloat(this.getAttribute('priority') ?? '0');
      this.#source = this.innerHTML;

      if (this.#source) {
        this.#sourceDiv = document.createElement('div');
        this.shadowRoot.appendChild(this.#sourceDiv);
      }

      if (this.#passageName) {
        this.#passageDiv = document.createElement('div');
        this.shadowRoot.appendChild(this.#passageDiv);
      }

      onPassageShown(this.render.bind(this), this.#priority);
    }

    render() {
      const passageName = this.#passageName;

      if (this.#passageDiv) {
        const passage = (passageName === '$current')
          ? window.story.passage
          : window.story.getPassage(passageName);

        if (passage) {
          this.#passageDiv.innerHTML = renderPassage(passage.source);
        } else {
          this.innerHTML = /* html */`<div class="alert alert-warning" role="alert">Could not find passage "${passageName}".</div>`;
        }
      }

      if (this.#sourceDiv) {
        this.#sourceDiv.innerHTML = renderPassage(this.#source);
      }
    }
}

export function setupWidgets() {
  customElements.define('widget', WidgetElement);
}

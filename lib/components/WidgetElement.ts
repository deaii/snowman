import Passage from '../Passage';
import renderPassage from '../util/renderPassage';

export default class WidgetElement extends HTMLDivElement {
  #passageName: string;

  #passagePromise?: Promise<Passage | null>;

  readonly #priority: number;

  readonly #passageDiv?: HTMLDivElement;

  #source: string;

  #sourceDiv?: HTMLDivElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.#passageName = this.getAttribute('passage') ?? '';
    this.#priority = Number.parseFloat(this.getAttribute('priority') ?? '0');
    this.#source = this.innerHTML;

    if (this.#passageName) {
      this.#passageDiv = document.createElement('div');
      this.shadowRoot!.appendChild(this.#passageDiv);
    }

    if (this.#source) {
      this.#sourceDiv = document.createElement('div');
      this.shadowRoot!.appendChild(this.#sourceDiv);
    }

    window.sm.events.onPassageShown(this.render.bind(this), this.#priority);
  }

  render() {
    const passageName = this.#passageName;

    if (this.#passageDiv) {
      let promise;

      if (passageName === '$current') {
        promise = Promise.resolve(window.sm.passage);
      } else {
        if (!this.#passagePromise) {
          this.#passagePromise = window.sm.story.getPassageAsync(passageName);
          if (this.#sourceDiv) {
            this.shadowRoot!.removeChild(this.#sourceDiv);
            this.#sourceDiv = undefined;
          }
        }
        promise = this.#passagePromise;
      }

      promise.then((passage) => {
        if (passage) {
          this.#passageDiv!.innerHTML = renderPassage(passage.text);
        } else {
          this.innerHTML = /* html */`<div class="alert alert-warning" role="alert">Could not find passage "${passageName}".</div>`;
        }
      });
    }

    if (this.#sourceDiv) {
      this.#sourceDiv.innerHTML = renderPassage(this.#source);
    }
  }
}

export function setupWidgets() {

}

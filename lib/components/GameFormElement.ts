// <game-form passage="passageName">...</game-form>
import { get, set } from 'object-path';
import { escape } from '../lodash';

export default class GameFormElement extends HTMLFormElement {
  #passage: string;

  constructor() {
    super();

    const self = this;

    this.#passage = this.getAttribute('passage')!;

    this.onsubmit = (ev: Event) => {
      ev.stopPropagation();

      const meta: { [key: string]: any } = {};

      new FormData(self).forEach((value, key) => {
        set(meta, key, value);
      });

      window.sm.engine.showAsync(self.#passage, meta);
    };
  }

  set(params: { [key: string]: any }) {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      const type = typeof value;

      if (type === 'object') {
        this.set(value);
      } else if (type === 'bigint' || type === 'string' || type === 'number' || type === 'boolean') {
        const query = `input[name='${escape(key)}']`;
        const elm = this.querySelector(query) as HTMLInputElement | undefined;
        if (elm) {
          elm.value = `${value}`;
        }
      }
    });
  }

  // When connected to the DOM, update every input in the form that has the
  // 'data-src' or 'src' attribute.
  connectedCallback() {
    if (this.isConnected) {
      this.querySelectorAll('input').forEach((input) => {
        // ts-ignore
        const src = input.dataset['src'] ?? input.getAttribute('src');
        if (src) {
          // eslint-disable-next-line no-param-reassign
          input.value = `${get(window.sm.state, src)}`;
        }
      });
    }
  }
}

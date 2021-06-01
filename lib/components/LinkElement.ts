//
// <game-link passage="passageName" meta="{&quot;cheese&quot;=true}" persist="true" />
//
export default class LinkElement extends HTMLButtonElement {
    #passage: string;

    #meta: { [key: string]: any };

    get passage() {
      return this.#passage || '';
    }

    get meta() {
      return this.#meta;
    }

    constructor() {
      super();
      this.type = 'button';

      const passage = this.getAttribute('passage');
      const meta = this.getAttribute('meta');

      this.disabled = !passage || !window.sm.story.hasPassage(passage);
      this.#passage = passage || '';
      this.#meta = meta ? JSON.parse(meta) : {};

      this.classList.add('btn', 'btn-primary', 'btn-sm');

      const self = this;

      this.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        if (!self.disabled) {
          const metaObj = this.#meta;

          window.sm.engine.showAsync(self.#passage, metaObj);
        }
      };
    }
}

//
// <game-link passage="passageName" meta="{&quot;cheese&quot;=true}" persist="true" />
//
export default class LinkElement extends HTMLButtonElement {
    #passage: string;

    #meta: { [key: string]: any };

    #persist: boolean;

    get passage() {
      return this.#passage || '';
    }

    get meta() {
      return this.#meta;
    }

    get persist() {
      return this.#persist;
    }

    constructor() {
      super();
      this.type = 'button';

      const passage = this.getAttribute('passage');
      const meta = this.getAttribute('meta');
      const persist = this.hasAttribute('persist');

      this.disabled = !passage || !window.story.getPassage(passage);
      this.#passage = passage || '';
      this.#meta = meta ? JSON.parse(meta) : {};
      this.#persist = !!persist;

      this.classList.add('btn', 'btn-primary', 'btn-sm');

      const self = this;

      this.onclick = (e: MouseEvent) => {
        e.stopPropagation();
        if (!self.disabled) {
          const metaObj = this.persist
            ? { ...this.#meta, ...window.formdata }
            : this.#meta;

          window.story.show(self.#passage, metaObj);
        }
      };
    }
}

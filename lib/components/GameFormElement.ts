
// <game-form passage="passageName">...</game-form>
export class GameFormElement extends HTMLFormElement {
    #passage: string;

    constructor() {
        super();

        const self = this;

        this.#passage = this.getAttribute('passage')!;

        this.onsubmit = (ev: Event) => {
            ev.stopPropagation();

            const meta: {[key: string]: any} = {};

            new FormData(self).forEach((value, key) => {
                window._.set(meta, key, value);
            });

            window.story.show(self.#passage, meta);
        }
    }

    // When connected to the DOM, update every input in the form that has the
    // 'data-src' attribute.
    connectedCallback() {
        if (this.isConnected) {
            this.querySelectorAll('input').forEach(input => {
                const src = input.dataset['src'];
                if (!!src){
                    input.value = `${window._.get(window.story.state, src)}`;
                }
            })
        }
    }
}

export function setupGameForms() {
    customElements.define("game-form", GameFormElement);
}

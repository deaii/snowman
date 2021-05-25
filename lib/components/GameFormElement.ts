import _ from "lodash";

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
                _.set(meta, key, value);
            });

            window.story.show(self.#passage, meta);
        }
    }
}

export function setupGameForms() {
    customElements.define("game-form", GameFormElement);
}

import _ from "lodash";
import { onPassageShown } from "../events/passageShown";

export class PassageElement extends HTMLDivElement {
    constructor() {
        super();

        const self = this;

        onPassageShown(() => {
            const {passage: passageName, meta: metaStr} = this.dataset;

            const passage = (passageName && passageName !== "$current")
                ? window.story.getPassage(passageName)
                : window.story.passage;

            if (passage){
                this.innerHTML = passage.render();
            }else{
                this.innerHTML = `<div class="alert alert-warning" role="alert">Could not find passage "${passageName}".</div>`
            }
        });
    }
}

export function setupPassages() {
    customElements.define("passage", PassageElement);
}
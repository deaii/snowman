import { onPassageShown } from "../events/passageShown";

export class WidgetElement extends HTMLDivElement {
    #passageName: string;
    #priority: number;

    constructor() {
        super();

        this.#passageName = this.getAttribute("passage") ?? '';
        this.#priority = Number.parseFloat(this.getAttribute("priority") ?? "0");

        const self = this;

        onPassageShown(() => {
            const { passage: passageName } = self.dataset;

            const passage = (passageName && passageName !== "$current")
                ? window.story.getPassage(passageName)
                : window.story.passage;

            if (passage){
                const parser = new DOMParser();
                this.innerHTML = passage.render();
            }else{
                this.innerHTML = `<div class="alert alert-warning" role="alert">Could not find passage "${passageName}".</div>`
            }
        }, self.#priority);
    }
}

export function setupWidgets() {
    customElements.define("widget", WidgetElement);
}
import { getUniqueId } from "../src/util/uniqueId";

// <sm-toggle name="isGood" src="s.isGood">label</sm-toggle>
export class ToggleElement extends HTMLDivElement {
    private static _template?: HTMLTemplateElement;

    #innerInput: HTMLInputElement;

    // NOTE: This doesn't use a Shadow Root, as we need the input visible in
    // the DOM.
    constructor() {
        super();

        if (!ToggleElement._template) {
            ToggleElement._template = document.getElementById('sm-toggle') as HTMLTemplateElement;
        }

        const body = ToggleElement._template.content.cloneNode() as DocumentFragment;

        const name = this.getAttribute("name")!;
        const src = this.getAttribute("src");
        const value = !!this.getAttribute("value");

        const switchId = getUniqueId();

        (body.querySelector('label[.form-check-label]') as HTMLLabelElement)
            .htmlFor = switchId;

        this.#innerInput = body.querySelector('input') as HTMLInputElement;
        this.#innerInput.name = name;
        this.#innerInput.id = switchId;
    }

    get value(): string {
        return this.#innerInput.value;
    }

    set value(val: string) {
        this.#innerInput.value = val;
    }

    reset() {

    }
}

export function setupToggle() {
    customElements.define('toggle', ToggleElement);
}
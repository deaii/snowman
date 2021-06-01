import getUniqueId from '../src/util/uniqueId';

// <sm-toggle name="isGood" src="s.isGood">label</sm-toggle>
export default class ToggleElement extends HTMLDivElement {
  private static template?: HTMLTemplateElement;

  #innerInput: HTMLInputElement;

  // NOTE: This doesn't use a Shadow Root, as we need the input visible in
  // the DOM.
  constructor() {
    super();

    if (!ToggleElement.template) {
      ToggleElement.template = document.getElementById('sm-toggle') as HTMLTemplateElement;
    }

    const body = ToggleElement.template.content.cloneNode() as DocumentFragment;

    const name = this.getAttribute('name')!;
    const value = this.getAttribute('value');

    const switchId = getUniqueId();

    (body.querySelector('label[.form-check-label]') as HTMLLabelElement)
      .htmlFor = switchId;

    this.#innerInput = body.querySelector('input') as HTMLInputElement;
    this.#innerInput.name = name;
    this.#innerInput.value = value ?? '';
    this.#innerInput.id = switchId;
  }

  get value(): string {
    return this.#innerInput.value;
  }

  set value(val: string) {
    this.#innerInput.value = val;
  }
}

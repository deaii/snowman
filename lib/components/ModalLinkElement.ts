import type { Modal } from 'bootstrap';
import { onPassageShown } from '../events/passageShown';

const MODAL_ID = 'sm-modal';
const MODAL_TITLE_ID = 'sm-modal-title';
const MODAL_BODY_ID = 'sm-modal-body';
const MODAL_FOOTER_ID = 'sm-modal-footer';

let titleEl: HTMLHeadingElement;
let bodyEl: HTMLDivElement;
let footerEl: HTMLDivElement;
let modalEl: HTMLDivElement;
let modal: Modal;

export default class ModalLinkElement extends HTMLButtonElement {
  constructor() {
    super();
    this.onclick = this.onClickEvent.bind(this);
  }

  onClickEvent() {
    let header = this.getAttribute('header');
    let footer = this.getAttribute('footer');
    let body = this.getAttribute('body');
    const passage = this.getAttribute('passage');
    const headerPsg = this.getAttribute('header-passage');
    const footerPsg = this.getAttribute('footer-passage');

    if (passage) {
      body = window.story.getPassage(passage)?.render()
                ?? `[Invalid passage "${passage}"]`;
    }

    if (headerPsg) {
      header = window.story.getPassage(headerPsg)?.render()
                ?? `[Invalid passage "${headerPsg}"]`;
    }

    if (footerPsg) {
      footer = window.story.getPassage(footerPsg)?.render()
                ?? `[invalid passage "${footerPsg}"]`;
    }

    titleEl.innerHTML = header ?? '';
    bodyEl.innerHTML = body ?? '';
    footerEl.innerHTML = footer ?? '';
    footerEl.hidden = !footer;

    modal.show();
  }
}

export function setupModal() {
  customElements.define('modal-link', ModalLinkElement);

  // Set up our private variables.
  modalEl = document.getElementById(MODAL_ID) as HTMLDivElement;
  titleEl = document.getElementById(MODAL_TITLE_ID) as HTMLHeadingElement;
  bodyEl = document.getElementById(MODAL_BODY_ID) as HTMLDivElement;
  footerEl = document.getElementById(MODAL_FOOTER_ID) as HTMLDivElement;

  // This needs to be loaded after Bootstrap.
  window.addEventListener('load', () => {
    // Make sure the modal hides when a new passage is shown.
    onPassageShown(() => modal.hide());

    // And set up our modal via bootstrap.
    modal = new window.bootstrap.Modal(modalEl);
  });
}

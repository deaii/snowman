// @ts-ignore
import Modal from 'bootstrap/js/src/modal';

import renderPassage from '../util/renderPassage';
import renderTitle from '../util/renderTitle';

const MODAL_ID = 'sm-modal';
const MODAL_TITLE_ID = 'sm-modal-title';
const MODAL_BODY_ID = 'sm-modal-body';
const MODAL_FOOTER_ID = 'sm-modal-footer';

let titleEl: HTMLHeadingElement;
let bodyEl: HTMLDivElement;
let footerEl: HTMLDivElement;
let modalEl: HTMLDivElement;
let modal: typeof Modal;

/* eslint-disable-next-line operator-linebreak */
const spinnerHtml = /* html */
`<div class="spinner-border spinner-border-sm text-primary" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;

export default class ModalLinkElement extends HTMLButtonElement {
  constructor() {
    super();
    this.onclick = this.onClickEvent.bind(this);
  }

  onClickEvent() {
    const bodyPsg = this.getAttribute('passage');
    const footerPsg = this.getAttribute('footer-passage');

    if (bodyPsg) {
      bodyEl.innerHTML = spinnerHtml;
      titleEl.innerHTML = spinnerHtml;
      window.sm.story.getPassageAsync(bodyPsg).then((passage) => {
        if (passage) {
          bodyEl.innerHTML = renderPassage(passage);
          titleEl.innerHTML = renderTitle(passage.title, passage);
        } else {
          bodyEl.innerText = `[Invalid passage "${bodyPsg}"]`;
          titleEl.innerText = 'error';
        }
      });
    } else {
      bodyEl.innerHTML = this.getAttribute('body') ?? '';
      titleEl.innerHTML = this.getAttribute('title') ?? '';
    }

    if (footerPsg) {
      footerEl.hidden = false;
      footerEl.innerHTML = spinnerHtml;
      window.sm.story.getPassageAsync(footerPsg).then((passage) => {
        footerEl.innerHTML = passage
          ? renderPassage(passage)
          : `[Invalid passage "${passage}"]`;
      });
    } else {
      const footer = this.getAttribute('footer') ?? '';
      footerEl.innerHTML = footer;
      footerEl.hidden = !footer;
    }

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
    window.sm.events.onPassageShown(() => modal.hide());

    // And set up our modal via bootstrap.
    modal = new Modal(modalEl);
  });
}

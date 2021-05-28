import type {Modal} from 'bootstrap';
import { onPassageShown } from '../events/passageShown';

const MODAL_ID = "sm-modal";
const MODAL_TITLE_ID = "sm-modal-title";
const MODAL_BODY_ID = "sm-modal-body";
const MODAL_FOOTER_ID = "sm-modal-footer";

let _title: HTMLHeadingElement;
let _body: HTMLDivElement;
let _footer: HTMLDivElement;
let _modalEl: HTMLDivElement;
let _modal: Modal;

export class ModalLinkElement extends HTMLButtonElement
{
    constructor() {
        super();
        this.onclick = this.onClickEvent.bind(this);
    }

    onClickEvent(ev: MouseEvent) {
        let header = this.getAttribute("header");
        let footer = this.getAttribute("footer");
        let body = this.getAttribute("body");
        const passage = this.getAttribute("passage");
        const headerPsg = this.getAttribute("header-passage");
        const footerPsg = this.getAttribute("footer-passage");

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
                ?? `[invalid passage "${footerPsg}"]`
        }

        _title.innerHTML = header ?? '';
        _body.innerHTML = body ?? '';
        _footer.innerHTML = footer ?? '';
        _footer.hidden = !footer;

        _modal.show();
    }
}

export function setupModal() {
    customElements.define('modal-link', ModalLinkElement);

    // This needs to be loaded after Bootstrap.
    window.addEventListener('load', () => {
        // Make sure the modal hides when a new passage is shown.
        onPassageShown(() => _modal.hide());

        // Set up our private variables.
        _modalEl = document.getElementById(MODAL_ID) as HTMLDivElement;
        _modal = new window.bootstrap.Modal(_modalEl);
        _title = document.getElementById(MODAL_TITLE_ID) as HTMLHeadingElement;
        _body = document.getElementById(MODAL_BODY_ID) as HTMLDivElement;
        _footer = document.getElementById(MODAL_FOOTER_ID) as HTMLDivElement;
    });
}
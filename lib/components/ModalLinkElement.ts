
import { Modal } from 'bootstrap';

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
        let {header, footer, body, passage, headerPsg, footerPsg} = this.dataset;

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

    document.addEventListener('load', () => {
        _modalEl = document.getElementById(MODAL_ID) as HTMLDivElement;
        _modal = new Modal(_modalEl);
        _title = document.getElementById(MODAL_TITLE_ID) as HTMLHeadingElement;
        _body = document.getElementById(MODAL_BODY_ID) as HTMLDivElement;
        _footer = document.getElementById(MODAL_FOOTER_ID) as HTMLDivElement;
    });
}
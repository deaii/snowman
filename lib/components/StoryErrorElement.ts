export default class StoryErrorElement extends HTMLDivElement {
  #template: HTMLTemplateElement;

  #debug: boolean;

  constructor() {
    super();
    this.#template = document.getElementById('sm.alert') as HTMLTemplateElement;
    this.#debug = this.hasAttribute('debug');
    this.innerHTML = '';

    const self = this;

    function onStoryError(this: Window, er: ErrorEvent) {
      const {
        message, filename, lineno, colno,
      } = er;

      let msg: string;

      // Create the message.
      // TODO: IF Twine is running in Debug, show a full JSON payload.
      if (self.#debug) {
        msg = JSON.stringify({
          message, filename, lineno, colno,
        }, null, 2)
          .replace(' ', '&nbsp;')
          .replace('\n', '<br />');
      } else {
        msg = message;
      }

      const alert = self.#template.content.cloneNode() as DocumentFragment;
      (alert.querySelector('.sm-alert-body') as HTMLSpanElement)
        .innerHTML = msg;

      self.appendChild(alert);
    }

    window.addEventListener('error', onStoryError);
  }
}

export function setupAlerts() {

}

import GameFormElement from './GameFormElement';
import { setupModal } from './ModalLinkElement';
import { setupWidgets } from './WidgetElement';
import { setupToggle } from './ToggleElement';
import LinkElement from './LinkElement';
import MarkdownElement from './PassageElement';

export default function setupComponents() {
  customElements.define('game-form', GameFormElement);
  customElements.define('game-link', LinkElement);
  customElements.define('markdown', MarkdownElement);
  setupModal();
  setupWidgets();
  setupToggle();
}

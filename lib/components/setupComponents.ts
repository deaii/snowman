import GameFormElement from './GameFormElement';
import WidgetElement from './WidgetElement';
import ToggleElement from './ToggleElement';
import LinkElement from './LinkElement';
import MarkdownElement from './PassageElement';
import { setupModal } from './ModalLinkElement';
import StoryErrorElement from './StoryErrorElement';

export default function setupComponents() {
  customElements.define('story-error', StoryErrorElement);
  customElements.define('game-form', GameFormElement);
  customElements.define('game-link', LinkElement);
  customElements.define('markdown', MarkdownElement);
  setupModal();
  customElements.define('widget', WidgetElement);
  customElements.define('toggle', ToggleElement);
}

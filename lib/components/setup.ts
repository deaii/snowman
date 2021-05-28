import { setupGameForms } from "./GameFormElement";
import { setupLinks } from "./LinkElement";
import { setupModal } from "./ModalLinkElement";
import { setupWidgets } from "./WidgetElement";
import { setupToggle } from "./ToggleElement";

export function setupComponents() {
    setupGameForms();
    setupLinks();
    setupModal();
    setupWidgets();
    setupToggle();
}

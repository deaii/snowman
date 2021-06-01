import EventBus from './EventBus';
import { PASSAGE_HIDDEN } from './PassageHiddenEvent';
import type PassageHiddenEvent from './PassageHiddenEvent';

export default class PassageHiddenEventBus extends EventBus<
  typeof PASSAGE_HIDDEN,
PassageHiddenEvent
> {
  constructor(target?: EventTarget) {
    super(PASSAGE_HIDDEN, target);
  }
}

import EventBus from './EventBus';
import PassageShownEvent, { PASSAGE_SHOWN } from './PassageShownEvent';

export default class PassageShownEventBus extends EventBus<
  typeof PASSAGE_SHOWN,
PassageShownEvent
> {
  constructor(target?: EventTarget) {
    super(PASSAGE_SHOWN, target);
  }
}

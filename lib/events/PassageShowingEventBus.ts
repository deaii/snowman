import EventBus from './EventBus';
import PassageShowingEvent, { PASSAGE_SHOWING } from './PassageShowingEvent';

export default class PassageShowingEventBus extends EventBus<
  typeof PASSAGE_SHOWING,
PassageShowingEvent
> {
  constructor(target?: EventTarget) {
    super(PASSAGE_SHOWING, target);
  }
}

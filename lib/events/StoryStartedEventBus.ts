import EventBus from './EventBus';
import StoryStartedEvent, { STORY_STARTED } from './StoryStartedEvent';

export default class StoryStartedEventBus extends EventBus<
  typeof STORY_STARTED,
StoryStartedEvent
> {
  constructor(target?: EventTarget) {
    super(STORY_STARTED, target);
  }
}

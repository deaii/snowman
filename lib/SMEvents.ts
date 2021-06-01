import type Engine from './Engine';

import PassageHiddenEvent from './events/PassageHiddenEvent';
import PassageHiddenEventBus from './events/PassageHiddenEventBus';
import PassageShowingEvent from './events/PassageShowingEvent';
import PassageShowingEventBus from './events/PassageShowingEventBus';
import PassageShownEvent from './events/PassageShownEvent';
import PassageShownEventBus from './events/PassageShownEventBus';
import StoryStartedEvent from './events/StoryStartedEvent';
import StoryStartedEventBus from './events/StoryStartedEventBus';
import type Passage from './Passage';
import { StoryState } from './State';

export default class SMEvents {
  passageHiddenEventBus: PassageHiddenEventBus;

  passageShowingEventBus: PassageShowingEventBus;

  passageShownEventBus: PassageShownEventBus;

  storyStartedEventBus: StoryStartedEventBus;

  constructor(target?: EventTarget) {
    this.passageHiddenEventBus = new PassageHiddenEventBus(target);
    this.passageShowingEventBus = new PassageShowingEventBus(target);
    this.passageShownEventBus = new PassageShownEventBus(target);
    this.storyStartedEventBus = new StoryStartedEventBus(target);
  }

  passageHidden(story: Engine, passage: Passage) {
    this.passageHiddenEventBus.dispatch(new PassageHiddenEvent(story, passage));
  }

  onPassageHidden(cb: (e: PassageHiddenEvent) => void, order?: number) {
    this.passageHiddenEventBus.addCallback(cb, order);
  }

  passageShowing(story: Engine, passage: Passage, meta: { [key: string]: any; } | null) {
    this.passageShowingEventBus.dispatch(new PassageShowingEvent(story, passage, meta));
  }

  onPassageShowing(cb: (e: PassageShowingEvent) => void, order?: number) {
    this.passageShowingEventBus.addCallback(cb, order);
  }

  passageShown(
    story: Engine,
    state: StoryState,
    passage: Passage,
    meta: { [key: string]: any; } | null,
  ) {
    this.passageShownEventBus.dispatch(new PassageShownEvent(story, state, passage, meta));
  }

  onPassageShown(cb: (e: PassageShownEvent) => void, order?: number) {
    this.passageShownEventBus.addCallback(cb, order);
  }

  storyStarted(story: Engine) {
    this.storyStartedEventBus.dispatch(new StoryStartedEvent(story));
  }

  onStoryStarted(cb: (e: StoryStartedEvent) => void, order?: number) {
    this.storyStartedEventBus.addCallback(cb, order);
  }
}

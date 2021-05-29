import type Passage from '../Passage';
import type Story from '../Story';
import EventBus from './EventBus';

type PassageHiddenName = 'sm.passage.hidden';
export const PASSAGE_HIDDEN: PassageHiddenName = 'sm.passage.hidden';

export class PassageHiddenEvent extends Event {
  readonly passage: Passage;

  readonly story: Story;

  constructor(
    story: Story,
    passage: Passage,
  ) {
    super(PASSAGE_HIDDEN);
    this.story = story;
    this.passage = passage;
  }
}

const eventBus = new EventBus<PassageHiddenName, PassageHiddenEvent, Window>(
  PASSAGE_HIDDEN,
  window,
);

export function passageHidden(
  story: Story,
  passage: Passage,
) {
  window.dispatchEvent(new PassageHiddenEvent(story, passage));
}

export const onPassageHidden = eventBus.addListener.bind(eventBus);

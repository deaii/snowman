import type Passage from '../Passage';
import type Story from '../Story';
import EventBus from './EventBus';

export type PassageShown = 'sm.passage.shown';
export const PASSAGE_SHOWN: PassageShown = 'sm.passage.shown';

export class PassageShownEvent extends Event {
  readonly passage: Passage;

  readonly story: Story;

  readonly meta: { [key: string]: any } | null;

  constructor(
    story: Story,
    passage: Passage,
    meta: { [key: string]: any } | null,
  ) {
    super(PASSAGE_SHOWN);
    this.story = story;
    this.passage = passage;
    this.meta = meta;
  }
}

const eventBus = new EventBus<PassageShown, PassageShownEvent, Window>(PASSAGE_SHOWN, window);

export function passageShown(
  story: Story,
  passage: Passage,
  meta: { [key: string]: any } | null,
) {
  window.dispatchEvent(new PassageShownEvent(story, passage, meta));
}

export const onPassageShown = eventBus.addListener.bind(eventBus);

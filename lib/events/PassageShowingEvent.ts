import type Passage from '../Passage';
import type Engine from '../Engine';

export const PASSAGE_SHOWING = 'sm.passage.hidden';

export default class PassageShowingEvent extends Event {
  readonly passage: Passage;

  readonly story: Engine;

  readonly meta: { [key: string]: any } | null;

  constructor(
    story: Engine,
    passage: Passage,
    meta: { [key: string]: any } | null,
  ) {
    super(PASSAGE_SHOWING);
    this.story = story;
    this.passage = passage;
    this.meta = meta;
  }
}

import type Passage from '../Passage';
import type Engine from '../Engine';

export const PASSAGE_HIDDEN = 'sm.passage.hidden';

export default class PassageHiddenEvent extends Event {
  readonly passage: Passage;

  readonly story: Engine;

  constructor(
    story: Engine,
    passage: Passage,
  ) {
    super(PASSAGE_HIDDEN);
    this.story = story;
    this.passage = passage;
  }
}

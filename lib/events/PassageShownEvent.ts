import type Passage from '../Passage';
import type { StoryState } from '../State';
import type Engine from '../Engine';

export const PASSAGE_SHOWN = 'sm.passage.shown';

export default class PassageShownEvent extends Event {
  readonly passage: Passage;

  readonly story: Engine;

  readonly state: StoryState;

  readonly meta: { [key: string]: any } | null;

  constructor(
    story: Engine,
    state: StoryState,
    passage: Passage,
    meta: { [key: string]: any } | null,
  ) {
    super(PASSAGE_SHOWN);
    this.story = story;
    this.state = state;
    this.passage = passage;
    this.meta = meta;
  }
}

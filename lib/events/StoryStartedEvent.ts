import type Engine from '../Engine';

export const STORY_STARTED = 'sm.story.start';

export default class StoryStartedEvent extends Event {
  readonly story: Engine;

  constructor(story: Engine) {
    super(STORY_STARTED);
    this.story = story;
  }
}

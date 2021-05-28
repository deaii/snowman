import type { Story } from '../Story';
import { EventBus } from './EventBus';

export type StoryStart = 'sm.story.start';
export const STORY_START: StoryStart = 'sm.story.start';

export class StoryStartEvent extends Event {
    readonly story: Story;
    constructor(story: Story) {
        super(STORY_START);
        this.story = story;
    }
}

const _eventBus = new EventBus<StoryStart, StoryStartEvent, Window>(STORY_START, window)

export function storyStarted(story: Story) {
    window.dispatchEvent(new StoryStartEvent(story));
}

export const onStoryStarted = _eventBus.addListener.bind(_eventBus);

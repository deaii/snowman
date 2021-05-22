import type { Story } from '../Story';

export const STORY_START = 'sm.story.start';

export class StoryStartEvent extends Event {
    readonly story: Story;
    constructor(story: Story) {
        super(STORY_START);
        this.story = story;
    }
}

export function storyStarted(story: Story) {
    window.dispatchEvent(new StoryStartEvent(story));
}

export function onStoryStarted(fn: (ev: StoryStartEvent) => void) {
    window.addEventListener(STORY_START, fn as EventListener);
}

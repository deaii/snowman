import type { Passage } from "../Passage";
import type { Story } from "../Story";

export const PASSAGE_HIDDEN = 'sm.passage.hidden';

export class PassageHiddenEvent extends Event {
    readonly passage: Passage;
    readonly story: Story;

    constructor(
        story: Story, 
        passage: Passage, 
    ){
        super(PASSAGE_HIDDEN);
        this.story = story;
        this.passage = passage;
    }
}

export function passageHidden(
    story: Story, 
    passage: Passage, 
){
    window.dispatchEvent(new PassageHiddenEvent(story, passage));
}

export function onPassageHidden(fn: (ev: PassageHiddenEvent) => void) {
    window.addEventListener(PASSAGE_HIDDEN, fn as EventListener);
}

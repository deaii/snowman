import type { Passage } from "../Passage";
import type { Story } from "../Story";

export const PASSAGE_SHOWING = 'sm.passage.hidden';

export class PassageShowingEvent extends Event {
    readonly passage: Passage;
    readonly story: Story;
    readonly meta: {[key: string]: any} | null;

    constructor(
        story: Story, 
        passage: Passage, 
        meta: {[key: string]: any} | null,
    ){
        super(PASSAGE_SHOWING);
        this.story = story;
        this.passage = passage;
        this.meta = meta;
    }
}

export function passageShowing(
    story: Story, 
    passage: Passage, 
    meta: {[key: string]: any} | null,
){
    window.dispatchEvent(new PassageShowingEvent(story, passage, meta));
}

export function onPassageShowing(fn: (ev: PassageShowingEvent) => void) {
    window.addEventListener(PASSAGE_SHOWING, fn as EventListener);
}

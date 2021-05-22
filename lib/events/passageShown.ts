import type { Passage } from "../Passage";
import type { Story } from "../Story";

export const PASSAGE_SHOWN = 'sm.passage.hidden';

export class PassageShownEvent extends Event {
    readonly passage: Passage;
    readonly story: Story;
    readonly meta: {[key: string]: any} | null;

    constructor(
        story: Story, 
        passage: Passage, 
        meta: {[key: string]: any} | null,
    ){
        super(PASSAGE_SHOWN);
        this.story = story;
        this.passage = passage;
        this.meta = meta;
    }
}

export function passageShown(
    story: Story, 
    passage: Passage, 
    meta: {[key: string]: any} | null,
){
    window.dispatchEvent(new PassageShownEvent(story, passage, meta));
}

export function onPassageShown(fn: (ev: PassageShownEvent) => void) {
    window.addEventListener(PASSAGE_SHOWN, fn as EventListener);
}

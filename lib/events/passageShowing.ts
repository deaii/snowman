import type { Passage } from "../Passage";
import type { Story } from "../Story";
import { EventBus } from "./EventBus";

type PassageShowing = 'sm.passage.hidden';
export const PASSAGE_SHOWING: PassageShowing = 'sm.passage.hidden';

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

const _eventBus = new EventBus<PassageShowing, PassageShowingEvent, Window>(PASSAGE_SHOWING, window);

export function passageShowing(
    story: Story, 
    passage: Passage, 
    meta: {[key: string]: any} | null,
){
    window.dispatchEvent(new PassageShowingEvent(story, passage, meta));
}

export const onPassageShowing = _eventBus.addListener.bind(_eventBus);

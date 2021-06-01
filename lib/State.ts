import type Config from './Config';

export type StoryState = State & { [key: string]: any };
export type AnyMap = { [key: string]: any };

/**
 * Retains all information retaining to the story that need to be immediately
 * accessible by story elements.  Using this prevents polluting the
 * global/window namespace.
 */
export default class State {
  constructor(other?: State) {
    if (other) {
      this.c = other.c;
      this.o = other.o;
      this.c = other.c;
    }

    // Assign window variables (such as '$' for jquery) to the story state
    // for access within scripts.  If the object is overwritten, this change
    // persists.
    if (this.c && this.c.globals) {
      this.c.globals.forEach((v) => { (this as any)[v] = (other ?? window as any)[v]; });
    }
  }

  //
  // The state of the game.  This is updated every time a passage is rendered,
  // and is snapshotted each time the story's history is updated.
  //
  s: AnyMap = {};

  get state() { return this.s; }

  set state(val: AnyMap) { this.s = val; }

  //
  // Passage Metadata, which is passed in via form or game link, which can alter
  // how passages are rendered.
  //
  m: AnyMap = {};

  get meta() { return this.m; }

  set meta(val: AnyMap) { this.m = val; }

  //
  // Global variables, such as user-defined or story-defined game options.
  // These persist independent of history or story progressing.
  //
  o: AnyMap = {};

  get optoins() { return this.o; }

  set options(val: AnyMap) { this.o = val; }

  //
  // Story configuration.
  //
  c: Config & AnyMap = {};

  get config() { return this.c; }

  set config(val: AnyMap) { this.c = val; }

  static get sm() { return window.sm; }
}

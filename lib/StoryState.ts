
export type StoryState = StoryStateImpl & {[key: string]: any};

export type AnyMap = {[key: string]: any};

/**
 * Retains all information retaining to the story that need to be 
 * immediately accessible by story elements.  Using this prevents
 * polluting the global/window namespace.
 */
export class StoryStateImpl {
  /**
   * The state of the game.  This is updated every time a passage
   * is rendered, and is snapshotted each time the story's history
   * is updated.
   **/
  #s: AnyMap = {};

  get s() { return this.#s; }
  set s(val: AnyMap) { this.#s = val; }

  get state() { return this.#s; }
  set state(val: AnyMap) { this.#s = val; }

  /**
   * Passage Metadata, which is passed in via form or game link,
   * which can alter how passages are rendered.
   */
  #m: AnyMap = {};
  get m() { return this.#m; }
  set m(val: AnyMap) { this.#m = val; }

  get meta() { return this.#m; }
  set meta(val: AnyMap) { this.#m = val; }

  /**
   * Global variables, such as user-defined or story-defined settings.
   * These persist independent of history or story progressing.
   **/
  #g: AnyMap = {};
  get g() { return this.#g; }
  set g(val: AnyMap) { this.#g = val; }

  get globals() { return this.#g; }
  set globals(val: AnyMap) { this.#g = val; }

  /**
   * Story configuration.
   */
  #c: AnyMap = {};
  get c() { return this.#c; }
  set c(val: AnyMap) { this.#c = val; }

  get config() { return this.#c; }
  set config(val: AnyMap) { this.#c = val; }

  /**
   * External dependencies.
   */
  get _() { return window._ };
  get $() { return window.$ };
  get bootstrap() { return window.bootstrap };
  get marked() { return window.marked };

  constructor(other?: StoryStateImpl) {
    if (!!other){
      this.#c = other.#c;
      this.#g = other.#g;
      this.#c = other.#c;
    }
  }
}
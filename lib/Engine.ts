import LZString from 'lz-string';
import qs from 'query-string';

import Passage from './Passage';
import SMEvents from './SMEvents';

import type { AnyMap } from './State';
import State from './State';
import TwineStory from './Story';

interface HistorySnapshot {
  state: AnyMap;
  meta: AnyMap;
  passage: string;
}

interface SaveState {
  state: AnyMap,
  passageName: string,
  meta: AnyMap,
  options: AnyMap,
  history: (HistorySnapshot | null)[]
}

/**
 * An object encompassing all of the functionality of Snowman, including
 * handling user state, passage loading and navigation, and history retention.
 */
export default class Engine {
  /**
   * The current passage.
   */
  #passage?: Passage;

  #story: TwineStory;

  #events: SMEvents;

  readonly state: State;

  get passage() {
    if (this.#passage) {
      return this.#passage;
    }

    throw new Error('No passage loaded');
  }

  /**
   * The previous states of  the story.  Allows rewind.
   */
  history: (HistorySnapshot | null)[] = [];

  /**
   * A blob containing information sent to the passage, either via form or link
   * attributes.
   */
  meta: { [key:string]: any } = {};

  /**
   * The message shown to users when there is an error and ignoreErrors is not
   * true.
   * */
  errorMessage: string = '';

  constructor(story: TwineStory, events: SMEvents, state?: State) {
    this.#story = story;
    this.#events = events;
    this.state = state ?? new State();
  }

  get hasHistory() {
    if (this.history.length === 0) {
      return false;
    }

    const firstPage = this.history.findIndex((v) => !!v);

    if ((firstPage === -1) || (firstPage === (this.history.length - 1))) {
      return false;
    }

    return this.history.length > 0;
  }

  get lastCheckpointIndex(): number {
    // If there is no history, then restart the game.
    if (this.history.length <= 1) {
      return -1;
    }

    // Step back through the history, skipping the most recent entry (since
    // that's the currently displayed passage.)
    for (let i = this.history.length - 2; i >= 0; i -= 1) {
      if (this.history[i]) {
        return i;
      }
    }

    return -1;
  }

  popHistory(): void {
    const lastCp = this.lastCheckpointIndex;

    if (lastCp < 0) {
      this.reset();
    } else {
      // Resume from this point, resetting the state of the
      // passage and history.
      const { state, meta, passage } = this.history[lastCp]!;

      // Yes, this removes the snapshot we got above.  It
      // will be pushed back on in show(...)
      this.history.splice(lastCp);

      // And here we go.
      this.state.s = state;
      this.showAsync(passage, meta);
    }
  }

  pushHistory() {
    this.history.push({
      state: this.state.s,
      meta: this.meta,
      passage: this.passage.id,
    });
  }

  pushEmptyHistory() {
    const len = this.history.length;
    if ((len > 0) && this.history[len - 1]) {
      this.history.push(null);
    }
  }

  reset() {
    this.state.s = {};
    this.history = [];
    this.showAsync(this.#story.startPassage);
  }

  /**
   * Begins playing this story.
   * */
  start(): void {
    this.#events.storyStarted(this);

    // Check the query string.
    // * If a save file name is provided, then load that save slot.
    // * If a "new-game" query parameter exists, then start a new game
    // * Otherwise, attempt to load the $default save slot, and start a new game
    //   otherwise.
    const queryStr = qs.parse(window.location.search);

    let saveSlot = queryStr['slot'] ?? '$default';

    if (queryStr['newgame'] !== undefined) {
      saveSlot = '';
    }

    if (Array.isArray(saveSlot)) {
      saveSlot = saveSlot[0]!;
    }

    if (saveSlot) {
      if (this.tryLoadSession(saveSlot)) {
        return;
      }
    }

    this.showAsync(this.#story.startPassage);
  }

  /**
   * Displays a passage on the page, replacing the current one. If there is no
   * passage by the name or ID passed, an exception is raised.
   *
   * Calling this immediately inside a passage (i.e. in its source code) will
   * not display the other passage. Use Story.render() instead.
   * @function show
   * @param {string} idOrName - ID or name of the passage
   * @param {boolean} noHistory - if true, then this will not be recorded in the
   * story history
   * @param meta - Metadata, as provided in link or form data.
   * @returns {void} - Returns nothing
   * */
  async showAsync(
    idOrName: string,
    meta: { [key: string]: any } | null = null,
    noHistory: boolean = false,
  ): Promise<void> {
    const passage = await this.#story.getPassageAsync(idOrName);

    if (passage === null) {
      throw new Error(
        `There is no passage with the ID or name "${idOrName}"`,
      );
    }

    if (this.#passage) {
      this.#events.passageHidden(this, this.#passage);
    }

    this.#events.passageShowing(this, passage, meta);

    if (!noHistory) {
      this.pushHistory();
    } else {
      this.pushEmptyHistory();
    }

    this.#passage = passage;
    this.meta = meta ?? {};

    this.#events.passageShown(this, this.state, passage, meta);
  }

  /**
   * Save the current state of the game to local storage.
   * @param slotName the name of the save slot.
   */
  saveSession(slotName?: string): void {
    const save: SaveState = {
      state: this.state.s,
      options: this.state.o,
      passageName: this.passage.id,
      meta: this.meta,
      history: this.history,
    };

    const contents = LZString.compressToUTF16(JSON.stringify(save));
    localStorage.setItem(
      `save_${this.#story.ifid}_${slotName}`,
      contents,
    );
  }

  /**
   * Tries to restore the story state from a hash value generated by saveHash().
   *
   * @function restore
   * @param {string} hash - Hash to restore from
   * @returns {boolean} if the restore succeeded
   */

  tryLoadSession(slotName: string): boolean {
    const hash = localStorage.getItem(`save_${this.#story.ifid}_${slotName}}`);

    if (!hash) {
      return false;
    }

    const {
      state,
      passageName,
      meta,
      options: globals,
      history,
    } = JSON.parse(LZString.decompressFromUTF16(hash)!) as SaveState;

    this.state.s = state;
    this.state.o = globals;
    this.history = history;

    this.showAsync(passageName, meta);

    return true;
  }

  restoreFromStorage() {
    const hash = localStorage.getItem(this.#story.ifid);

    if (hash) {
      this.tryLoadSession(hash);
    }

    // TODO Restore Event
  }
}

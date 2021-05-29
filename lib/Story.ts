import { isArray } from 'lodash';
import LZString from 'lz-string';
import * as qs from 'query-string';

import {
  passageHidden,
  passageShowing,
  passageShown,
  storyStarted,
} from './events';

import Passage from './Passage';

import {
  CONFIG_TAG,
  STYLE_TAG,
  SCRIPT_TAG,
  LAYOUT_TAG,
} from './reservedTags';

import { AnyMap, StoryState, StoryStateImpl } from './StoryState';
import SortedArray from './util/SortedArray';

interface HistorySnapshot {
  state: AnyMap;
  meta: AnyMap;
  passage: string;
}

interface SaveState {
  state: AnyMap,
  passageName: string,
  meta: AnyMap,
  globals: AnyMap,
  history: (HistorySnapshot| null)[]
}

interface UserScript {
  script: string;
  order: number;
}

interface UserStyle {
  style: string;
  order: number;
}

/**
 * An object representing the entire story. After the document has completed
 * loading, an instance of this class will be available at `window.story`.
 *
 * @class Story
 */
export default class Story {
  #passages: { [id: string]: Passage };

  /**
   * The name of the story
   */
  name: string;

  /**
   * The GUID of the story.
   */
  ifid: string;

  /**
   * The ID of the starting passage for this story
   */
  startPassage: string;

  /**
   * The current passage.
   */
  #passage?: Passage;

  /**
   * The current state of the game.
   */
  #state: StoryState = new StoryStateImpl();

  public get state() {
    return this.#state;
  }

  get passage() {
    if (this.#passage) {
      return this.#passage;
    }

    throw new Error('No passage loaded');
  }

  /**
   * The progream that created or compiled this story
   */
  creator: string;

  /**
   * The version of the program used to create/compile this story.
   */
  creatorVersion: string;

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

  /**
   * An array of user-specific scripts to run when the story is begun.  Scripts
   * are executed in priority order.
   * */
  #userScripts: SortedArray<UserScript> = new SortedArray((a, b) => a.order - b.order);

  /**
   * An array of user-specified stylesheets.  These are appended to the browser
   * document on load, in order of priority (in ascending order).
   */
  #userStyles: SortedArray<UserStyle> = new SortedArray((a, b) => a.order - b.order);

  constructor(rootDocument: ParentNode, dataEl: HTMLElement, skipLoad?: boolean) {
    // Get the story metadata.
    this.name = dataEl.getAttribute('name')!;
    this.ifid = dataEl.getAttribute('ifid')!;
    this.startPassage = dataEl.getAttribute('startnode')!;
    this.creator = dataEl.getAttribute('creator')!;
    this.creatorVersion = dataEl.getAttribute('creator-version')!;

    if (!skipLoad) {
      this.load(rootDocument, dataEl);
    }

    this.#passages = {};
  }

  load(dataEl: ParentNode, root: ParentNode = document) {
    // Add the internal (HTML) contents of all SCRIPT tags
    root.querySelectorAll<HTMLElement>('*[type="text/twine-javascript"]')
      .forEach((el) => { this.#userScripts.push({ script: el.innerHTML, order: 0 }); });

    // Add the internal (HTML) contents of all STYLE tags
    root.querySelectorAll<HTMLElement>('*[type="text/twine-css"]')
      .forEach((value) => { this.#userStyles.push({ style: value.innerHTML, order: 0 }); });

    // Used for getting script and style priority.
    function getPriority(tag: undefined | true | string) {
      return (tag === true) ? 0 : Number.parseFloat(tag ?? '0');
    }

    dataEl.querySelectorAll('tw-passagedata').forEach((e) => {
      const passage = new Passage(e);
      const { tags } = passage;

      const configTag = tags[CONFIG_TAG];
      const styleTag = tags[STYLE_TAG];
      const scriptTag = tags[SCRIPT_TAG];
      const layoutTag = tags[LAYOUT_TAG];

      if (configTag !== undefined) {
        // Story Configuration
        Object.assign(window.config, JSON.parse(passage.source));
      } else if (styleTag !== undefined) {
        // User Style
        this.#userStyles.push({ style: passage.source, order: getPriority(styleTag) });
      } else if (scriptTag !== undefined) {
        // User JavaScript
        this.#userScripts.push({ script: passage.source, order: getPriority(scriptTag) });
      } else if (layoutTag !== undefined) {
        // Layout
        /// / TODO:
      } else {
        // Actual Passage
        this.#passages[passage.id] = passage;
      }
    });
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
      this.#state.s = state;
      this.show(passage, meta);
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
    this.show(this.startPassage);
  }

  /**
   * Begins playing this story.
   * */
  start(): void {
    //
    // Activate user styles.
    //
    this.#userStyles.forEach(({ style }) => {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = style;
      document.head.appendChild(styleEl);
    });

    this.#userStyles.slice(0);

    // TODO: I'll convert this to a script tag or Function() call at some point.
    //
    // Run user scripts
    //
    this.#userScripts.forEach(({ script }) => {
      /* eslint-disable no-eval */
      eval(script);
      /* eslint-enable no-eval */
    });

    this.#userScripts.slice(0);

    storyStarted(this);

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

    if (isArray(saveSlot)) {
      saveSlot = saveSlot[0]!;
    }

    if (saveSlot) {
      if (this.tryLoadSession(saveSlot)) {
        return;
      }
    }

    this.show(this.startPassage);
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
  show(
    idOrName: string,
    meta: { [key: string]: any } | null = null,
    noHistory: boolean = false,
  ): void {
    const passage = this.getPassage(idOrName);

    if (passage === null) {
      throw new Error(
        `There is no passage with the ID or name "${idOrName}"`,
      );
    }

    if (this.#passage) {
      passageHidden(this, this.#passage);
    }

    passageShowing(this, passage, meta);

    if (!noHistory) {
      this.pushHistory();
    } else {
      this.pushEmptyHistory();
    }

    this.#passage = passage;
    this.meta = meta ?? {};

    passageShown(this, passage, meta);
  }

  /**
   * Returns the HTML source for a passage. This is most often used when
   * embedding one passage inside another. In this instance, make sure to use
   * <%= %> instead of <%- %> to avoid incorrectly encoding HTML entities.
   */
  render(idOrName: string): string {
    const passage = this.getPassage(idOrName);

    if (!passage) {
      throw new Error(`There is no passage with the ID or name ${idOrName}`);
    }

    return passage.render();
  }

  getPassage(idOrName: string): Passage | null {
    // First, search by ID
    const passage = this.#passages[idOrName]
      // And if that doesn't work, look for a passage with the same title.
      ?? Object.values(this.#passages).find((p) => p.title === idOrName);

    return passage ?? null;
  }

  /**
   * Save the current state of the game to local storage.
   * @param slotName the name of the save slot.
   */
  saveSession(slotName?: string): void {
    const save: SaveState = {
      state: this.state.s,
      globals: this.state.g,
      passageName: this.passage.id,
      meta: this.meta,
      history: this.history,
    };

    const contents = LZString.compressToUTF16(JSON.stringify(save));
    localStorage.setItem(
      `save_${this.ifid}_${slotName}`,
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
    const hash = localStorage.getItem(`save_${this.ifid}_${slotName}}`);

    if (!hash) {
      return false;
    }

    const {
      state,
      passageName,
      meta,
      globals,
      history,
    } = JSON.parse(LZString.decompressFromUTF16(hash)!) as SaveState;

    this.state.s = state;
    this.state.g = globals;
    this.history = history;

    this.show(passageName, meta);

    passageShown(this, this.passage, meta);

    return true;
  }

  restoreFromStorage() {
    const hash = localStorage.getItem(this.ifid);

    if (hash) {
      this.tryLoadSession(hash);
    }

    // TODO Restore Event
  }
}

/**
 * @external Element
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Element}
 */

import LZString from 'lz-string';
import * as qs from 'query-string';

import { passageHidden, passageShowing, passageShown, storyStarted } from './events';
import { Passage } from './Passage';
import { CONFIG_TAG, STYLE_TAG, SCRIPT_TAG, LAYOUT_TAG } from './reservedTags';

import { AnyMap, StoryState, StoryStateImpl } from './StoryState';

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

/**
 * An object representing the entire story. After the document has completed
 * loading, an instance of this class will be available at `window.story`.
 *
 * @class Story
 */
export class Story {

  #passages: {[id: string]: Passage};

  #passageArray?: Passage[];

  private get _passageArray() {
    if (!this.#passageArray){
      this.#passageArray = Object.values(this.#passages).sort((a, b) => a.id.localeCompare(b.id));
    }

    return this.#passageArray;
  }

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
    if (this.#passage){
      return this.#passage;
    }

    throw new Error("No passage loaded");
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
  meta: {[key:string]: any} = {};

  /**
   * The message shown to users when there is an error and ignoreErrors is not
   * true.
   **/
  errorMessage: string = '';

  /**
   * An array of user-specific scripts to run when the story is begun.  Scripts
   * are executed in priority order.
   **/
  #userScripts: {script: string, priority: number}[];

  /**
   * An array of user-specified stylesheets.  These are appended to the browser
   * document on load, in order of priority (in ascending order).
   */
  #userStyles: {style: string, priority: number}[];
  
  constructor (dataEl: HTMLElement) {
    // Get the story metadata.
    this.name = dataEl.getAttribute('name')!;
    this.ifid = dataEl.getAttribute('ifid')!;
    this.startPassage = dataEl.getAttribute('startnode')!;
    this.creator = dataEl.getAttribute('creator')!;
    this.creatorVersion = dataEl.getAttribute('creator-version')!;

    this.#userScripts = [];

    // Add the internal (HTML) contents of all SCRIPT tags
    document.querySelectorAll<HTMLElement>('*[type="text/twine-javascript"]')
      .forEach(el => { this.#userScripts.push({script: el.innerHTML, priority: 0}); });

    this.#userStyles = [];

    // Add the internal (HTML) contents of all STYLE tags
    document.querySelectorAll<HTMLElement>('*[type="text/twine-css"]')
      .forEach(value => { this.#userStyles.push({style: value.innerHTML, priority: 0}); });

    // Used for getting script and style priority.
    function getPriority(tag: undefined | true | string) {
      return (tag === true) ? 0 : Number.parseFloat(tag ?? '0');
    }

    this.#passages = {};

    dataEl.querySelectorAll('tw-passagedata').forEach(e =>  {
      let passage = new Passage(e);
      let tags = passage.tags;

      let configTag = tags[CONFIG_TAG];
      let styleTag = tags[STYLE_TAG];
      let scriptTag = tags[SCRIPT_TAG];
      let layoutTag = tags[LAYOUT_TAG];

      if (configTag !== undefined){
        // Story Configuration
        Object.assign(window.config, JSON.parse(passage.source));
      } else if (styleTag !== undefined){
        // User Style
        this.#userStyles.push({style: passage.source, priority: getPriority(styleTag)});
      } else if (scriptTag !== undefined){
        // User JavaScript
        this.#userScripts.push({ script: passage.source, priority: getPriority(scriptTag)});
      } else if (layoutTag !== undefined){
        // Layout
        //// TODO:
      }else {
        // Actual Passage
        this.#passages[passage.id] = passage;
      }
    });

    this.#userScripts.sort((a, b) => (a.priority - b.priority));
    this.#userStyles.sort((a, b) => (a.priority - b.priority));
  }

  get hasHistory() {
    return this.history.length > 0;
  }

  popHistory() {
    // If there is no history, then restart the game.
    if (this.hasHistory){
      this.state.s = {};
      this.show(this.startPassage)
    }

    // Discard the top of the history stack.  If it is the current
    // passage, this will force us one back.  Otherwise, the
    // top of the stack is a null object, and needs to be discarded.
    this.history.pop();

    // Remove any consecutive null entries.
    while (!this.history[this.history.length - 1]){
      this.history.pop();
    }

    // If no history remains, again, restart the game.
    if (this.history.length == 0){
      this.state.s = {};
      this.show(this.startPassage);
    }

    // Otherwise, resume from the next entry in the history.
    // We pop the history here: show() will push it back on.
    const {state, meta, passage} = this.history.pop()!;
    this.state.s = state;

    this.show(passage, meta);
  }

  pushHistory(){
    this.history.push({
      state: this.state.s,
      meta: this.meta,
      passage: this.passage.id
    })
  }

  pushEmptyHistory(){
    const len = this.history.length;
    if ((len > 0) && this.history[len - 1]){
      this.history.push(null);
    }
  }

  /**
   * Begins playing this story.
   **/
  start(): void {
    //
    // Activate user styles.
    //
    this.#userStyles.forEach(({style}) => {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = style;
      document.head.appendChild(styleEl);
    });

    this.#userStyles = [];

    // TODO: I'll convert this to a script tag or Function() call at some point.
    //
    // Run user scripts
    //
    this.#userScripts.forEach(({script}) => {
      /* eslint-disable no-eval */
      eval(script);
      /* eslint-enable no-eval */
    });

    this.#userScripts = [];

    const self = this;

    storyStarted(this);

    const parsedQuery = qs.parse(location.search);

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
   **/
  show (
    idOrName: string, 
    meta: {[key: string]: any} | null = null, 
    noHistory: boolean = false,
  ): void {
    var passage = this.getPassage(idOrName);

    if (passage === null) {
      throw new Error(
        'There is no passage with the ID or name "' + idOrName + '"'
      );
    }

    if (this.#passage) {
      passageHidden(this, this.#passage);
    }

    passageShowing(this, passage, meta);

    if (!noHistory) {
      this.pushHistory();
    }else{
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
  render (idOrName: string): string {
    var passage = this.getPassage(idOrName);

    if (!passage) {
      throw new Error('There is no passage with the ID or name ' + idOrName);
    }

    return passage.render();
  }

  getPassage(idOrName: string): Passage | null{

    let passage = this.#passages[idOrName];

    if (!passage){
      passage = this._passageArray.find(p => p.title == idOrName);
    }

    return passage ?? null;
  }

  /**
   * Save the current state of the game to local storage.
   * @param slotName the name of the save slot.  Defaults to, well, 'default'.
   */
  save (slotName?: string): void {
    localStorage.setItem(
      `save_${this.ifid}_${slotName ?? 'default'}`,
      this.saveHash(),
    );
  }

  /**
   * Returns LZString + compressBase64 Hash.
   *
   * @function saveHash
   * @returns {string} - Returns the LZString hash
   */
  saveHash (): string {
    const save: SaveState = {
      state: this.state.s,
      globals: this.state.g,
      passageName: this.passage.id,
      meta: this.meta,
      history: this.history,
    };

    return LZString.compressToUTF16(JSON.stringify(save));
  }

  /**
   * Tries to restore the story state from a hash value generated by saveHash().
   *
   * @function restore
   * @param {string} hash - Hash to restore from
   * @returns {boolean} if the restore succeeded
   */

  restore (slotName: string): void {
    const hash = localStorage.getItem(`save_${this.ifid}_${slotName ?? 'default'}`);

    if (!hash) {
      return;;
    }

    const { 
      state, 
      passageName, 
      meta, 
      globals, 
      history, 
    } = JSON.parse(LZString.decompressFromUTF16(hash)!) as SaveState;

    this.state.s = state;
    this.#passage = this.getPassage(passageName)!;
    this.meta = meta;
    this.state.g = globals;
    this.history = history;

    passageShown(this, this.passage, meta);
  }

  restoreFromStorage() {
    const hash = localStorage.getItem(this.ifid);

    if (hash){
      this.restore(hash);
    }

    // TODO Restore Event
  }
}

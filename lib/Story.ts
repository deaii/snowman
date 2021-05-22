/**
 * @external Element
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Element}
 */

import LZString from 'lz-string';
import * as qs from 'query-string';

import { storyStarted } from './events';
import { passageHidden } from './events/passageHidden';
import { passageShowing } from './events/passageShowing';
import { passageShown } from './events/passageShown';
import { Passage } from './Passage';

interface HistorySnapshot {
  state: {[key: string]: any};
  meta: {[key: string]: any};
  passage: string;
}

/**
 * An object representing the entire story. After the document has completed
 * loading, an instance of this class will be available at `window.story`.
 *
 * @class Story
 */
export class Story {

  #passages: Passage[];

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
   * The current state of the story.  This persists when the user reloads.
   */
  state: {[key: string]: any} = {};

  /**
   * A blob containing information sent to the passage, either via form or link
   * attributes.
   */
  meta: {[key:string]: any} = {};

  /**
   * Variables that exist outside of the story.  These are not affected by
   * movement through the story history.
   */
  globals: {[key: string]: any} = {};

  /**
   * The message shown to users when there is an error and ignoreErrors is not
   * true.
   **/
  errorMessage: string = '';

  /**
   * An array of user-specific scripts to run when the story is begun.
   **/
  #userScripts: string[];

  /**
   * An array of user-specified stylesheets.  These are appended to the browser
   * document on load.
   */
  #userStyles: string[];
  
  /**
   * The element to render the story to.
   */
  readonly bodyEl: HTMLDivElement;

  readonly passageEl: HTMLDivElement;

  constructor (dataEl: HTMLElement, bodyEl: HTMLDivElement) {

    this.bodyEl = bodyEl;

    // Create the passage element
    this.passageEl = document.createElement('div');
    this.passageEl.className = "sm-passage";
    this.passageEl.setAttribute('aria-live', 'polite');
    this.bodyEl.appendChild(this.passageEl);

    // Get the story metadata.
    this.name = dataEl.getAttribute('name')!;
    this.ifid = dataEl.getAttribute('ifid')!;
    this.startPassage = dataEl.getAttribute('startnode')!;
    this.creator = dataEl.getAttribute('creator')!;
    this.creatorVersion = dataEl.getAttribute('creator-version')!;

    // Get the passages from the HTML passage data.
    this.#passages = [];

    dataEl.querySelectorAll('tw-passagedata').forEach((passageEl) => {
      const id = passageEl.getAttribute('pid')!;
      const name = passageEl.getAttribute('name')!;
      const tags = passageEl.getAttribute('tags');

      this.#passages.push(new Passage(
        id,
        name,
        (!!tags) ? tags.split(' ') : [],
        passageEl.innerHTML
      ));
    });

    this.#userScripts = [];

    // Add the internal (HTML) contents of all SCRIPT tags
    document.querySelectorAll<HTMLElement>('*[type="text/twine-javascript"]')
      .forEach(el => { this.#userScripts.push(el.innerHTML); });

    this.#userStyles = [];

    // Add the internal (HTML) contents of all STYLE tags
    document.querySelectorAll<HTMLElement>('*[type="text/twine-css"]')
      .forEach(value => { this.#userStyles.push(value.innerHTML); });

    // TODO: Setup Story Errors
  }

  get hasHistory() {
    return this.history.length > 0;
  }

  popHistory() {
    if (this.hasHistory){
      return;
    }

    while (!this.history[this.history.length - 1]){
      this.history.pop();
    }

    const {state, passage} = this.history.pop()!;
    this.state = state;

  }

  pushHistory(){
    this.history.push({
      state: this.state,
      meta: this.meta,
      passage: this.passage.name
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
   *
   * @function start
   * @param {Element} el - Element to show content in
   * @returns {void}
   **/

  start () {
    /* Activate user styles. */
    this.#userStyles.forEach((style) => {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = style;
      this.bodyEl.appendChild(styleEl);
    });

    /* Run user scripts. */
    this.#userScripts.forEach((script: string) => {
      try {
        /* eslint-disable no-eval */
        eval(script);
        /* eslint-enable no-eval */
      } catch (error) {
        // TODO: Story Error
        ////$.event.trigger('sm.story.error', [error, 'Story JavaScript Eval()']);
      }
    });

    const self = this;

    // Set up link click handler.
    this.bodyEl.addEventListener('click', (e: MouseEvent) => {
      var target = e.target as HTMLElement;

      if ((target.tagName == 'A') && target.dataset && target.dataset['passage']){
        e.stopPropagation();
        const {passage, meta} = target.dataset;
        const metaJson = meta ? JSON.parse(unescape(meta)) : null;
        self.show(unescape(passage), metaJson);
      }
    });

    this.bodyEl.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const submitter = (e as any).submitter as HTMLInputElement;
      if (!submitter){
        throw new Error("SubmitEvent had no submitter.  IE/Safari?");
      }

      const form = submitter.form;

      if (!form){
        throw new Error("SubmitEvent target has no form ref.");
      }

      const passage = form.dataset['passage'];

      if (!passage){
        throw new Error("Form has no 'data-passage' attribute");
      }

      const meta: {[key: string]: any} = {};
      new FormData(form).forEach((value, key) => {
        // If the object doesn't contain the key, add
        // the object.
        if(!Reflect.has(meta, key)){
            meta[key] = value;
            return;
        }

        // Otherwise, assume the value needs to be an 
        // array, convert if needed, and append.
        if(!Array.isArray(meta[key])){
            meta[key] = [meta[key]];    
        }

        meta[key].push(value);
      });

      self.show(passage, meta);
    });

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

    this.passageEl.innerHTML = passage.render();

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
    let passage = this.#passages.find(p => p.id == idOrName);

    if (!passage){
      passage = this.#passages.find(p => p.name == idOrName);
    }

    return passage ?? null;
  }

  /**
   * Sets the URL hash property to the hash value created by saveHash().
   *
   * @function save
   * @param {string} hash - Hash to set URL
   * @returns {void} - Returns nothing
   */
  save (hash: string) {
    localStorage.setItem(this.ifid, hash);
  }

  /**
   * Returns LZString + compressBase64 Hash.
   *
   * @function saveHash
   * @returns {string} - Returns the LZString hash
   */
  saveHash (): string {
    const hash = LZString.compressToUTF16(JSON.stringify({
      state: this.state,
      passageName: this.passage.id,
      meta: this.meta,
      history: this.history,
      globals: this.globals,
    }));

    this.save(hash);

    // TODO: Save Event

    return hash;
  }

  /**
   * Tries to restore the story state from a hash value generated by saveHash().
   *
   * @function restore
   * @param {string} hash - Hash to restore from
   * @returns {boolean} if the restore succeeded
   */

  restore (hash: string): void {
    const {state, passageName, meta, globals, history }
        = JSON.parse(LZString.decompressFromUTF16(hash)!);

    this.state = state;
    this.#passage = this.getPassage(passageName)!;
    this.meta = meta;
    this.globals = globals;
    this.history = history;

    this.passageEl.innerHTML = this.passage.render();
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

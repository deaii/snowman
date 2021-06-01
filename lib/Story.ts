import Config from './Config';
import Passage from './Passage';

import {
  CONFIG_TAG,
  LAYOUT_TAG,
} from './reservedTags';

import createPassage from './util/createPassage';

/**
 * Represents the entire writer-defined experience, including all written
 * passages, story information, and engine configuration.
 *
 * It's set when the story loads, and remains static afterwards.  All data
 * regarding progress and user interaction is kept in Engine.ts.
 */
export interface Story {
  /**
   * The name of the story
   */
  readonly name: string;

  /**
   * The GUID of the story.
   */
  readonly ifid: string;

  /**
   * The ID of the starting passage for this story
   */
  readonly startPassage: string;

  /**
   * The progream that created or compiled this story
   */
  readonly creator: string;

  /**
   * The version of the program used to create/compile this story.
   */
  readonly creatorVersion: string;

  /**
   * The engine configuration.
   */
  readonly config: Config;

  /**
   * The HTML Layout.
   */
  readonly layout: string;

  /**
   * Get a passage using the provided ID or name.  Asynchronous, in case
   * passages are stored on a web server.
   *
   * @param idOrName
   * */
  getPassageAsync(idOrName: string): Promise<Passage | null>;

  hasPassage(idOrName: string): boolean;
}

export default class TwineStory implements Story {
  #passages: { [id: string]: Passage } = {};

  /**
   * The name of the story
   */
  name: string = '';

  /**
   * The GUID of the story.
   */
  ifid: string = '';

  /**
   * The ID of the starting passage for this story
   */
  startPassage: string = '';

  /**
   * The progream that created or compiled this story
   */
  creator: string = '';

  /**
   * The version of the program used to create/compile this story.
   */
  creatorVersion: string = '';

  config: Config = {};

  /**
   * The message shown to users when there is an error and ignoreErrors is not
   * true.
   * */
  errorMessage: string = '';

  /**
   * The HTML Layout.
   */
  layout: string = '';

  constructor(dataElement: HTMLElement) {
    // Get the story metadata.
    this.name = dataElement.getAttribute('name')!;
    this.ifid = dataElement.getAttribute('ifid')!;
    this.startPassage = dataElement.getAttribute('startnode')!;
    this.creator = dataElement.getAttribute('creator')!;
    this.creatorVersion = dataElement.getAttribute('creator-version')!;

    dataElement.querySelectorAll('tw-passagedata').forEach((e) => {
      const passage = createPassage(e);
      const { tags } = passage;

      const configTag = tags[CONFIG_TAG];
      const layoutTag = tags[LAYOUT_TAG];

      if (configTag !== undefined) {
        // Story Configuration
        Object.assign(this.config, JSON.parse(passage.text));
      } else if (layoutTag !== undefined) {
        // Layout
        this.config.layoutHtml = passage.text;
      } else {
        // Actual Passage
        this.#passages[passage.id] = passage;
      }
    });
  }

  getPassageAsync(idOrName: string): Promise<Passage | null> {
    return Promise.resolve(this.getPassage(idOrName));
  }

  getPassage(idOrName: string): Passage | null {
    // First, search by ID
    const passage = this.#passages[idOrName]
      // And if that doesn't work, look for a passage with the same title.
      ?? Object.values(this.#passages).find((p) => p.name === idOrName);

    return passage ?? null;
  }

  hasPassage(idOrName: string): boolean {
    return !!this.getPassage(idOrName);
  }
}

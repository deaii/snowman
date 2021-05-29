/**
 * An object representing a passage. The current passage will be `window.passage`
 *
 * @class Passage
 */

import renderSource from './util/renderPassage';

const PASSAGE_REGEX = /^(\s*#!({(.|\n)*?})!#)?((.|\n)*)/i;
const META_GROUP = 2;
const PASSAGE_TEXT_GROUP = 4;

function parseTags(tagsStr: string | null): PassageTags {
  if (!tagsStr) {
    return {};
  }

  const rVal: { [key: string]: string | true } = {};

  tagsStr.split(' ').forEach((str: string) => {
    const eqIndex = str.indexOf('=');

    if (eqIndex > 0) {
      rVal[str.substr(0, eqIndex)] = str.substr(eqIndex + 1);
    } else {
      rVal[str] = true;
    }
  });

  return rVal;
}

function extractMeta(text: string): PassageMetadata {
  const match = text.match(PASSAGE_REGEX);

  if (match == null) {
    return { text: '', meta: '' };
  }

  return {
    text: match[PASSAGE_TEXT_GROUP] ?? '',
    meta: match[META_GROUP] ?? '',
  };
}

export type PassageTags = { [tag: string]: string | true };
export type PassageMetadata = { [key: string]: any };

export default class Passage {
  /**
   * The unique identifier
   */
  id: string;

  /**
   * Name of the passage, as specified in Twine
   */
  title: string;

  /**
   * A function that returns the name of the passage based on the current state
   * of the game.  Specified in metadata.
   */
  #titleFunc?: (this: Passage) => string;

  get renderedTitle(): string {
    if (this.#titleFunc) {
      return this.#titleFunc();
    }
    return this.title;
  }

  /**
   * Tags.
   *
   * If a tag is supplied in <key>=<value> format, then it is parsed as such.
   */
  tags: PassageTags;

  /**
   * Metadata, given as a JSON object.  Can be used to overwrite the passage's
   * ID, title,
   */
  meta: PassageMetadata = {};

  text: string = '';

  /**
   * The full source code of the passage, after HTML-decoding.
   */
  readonly source: string;

  constructor(passageEl: Element, preserveSource?: boolean) {
    const id = passageEl.getAttribute('pid')!;
    const name = passageEl.getAttribute('name')!;
    const tags = parseTags(passageEl.getAttribute('tags'));
    const source = window._.unescape(passageEl.innerHTML);

    // We can supply the original source as a readonly string for debug
    // purposes, but generally this only takes up unneeded memory.
    this.source = preserveSource ? source : '';

    // Extract metadata
    const { text, meta: metaStr } = extractMeta(this.source);
    this.text = text;
    this.meta = metaStr
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      ? new Function(`return (${metaStr});`)()
      : {};

    // Extract passage title
    const metaTitle = this.meta['title'];
    if (typeof metaTitle === 'function') {
      this.#titleFunc = metaTitle.bind(this);
      this.title = '';
    } else if (typeof metaTitle === 'string') {
      this.title = metaTitle;
    } else {
      this.title = name ?? '[unnamed]';
    }

    this.id = this.meta['id'] ?? id ?? 1;

    this.tags = {
      ...tags,
      ...(this.meta['tags'] ?? {}),
    };
  }

  render() {
    return renderSource(this.text, this.tags);
  }

  getTag(tagName: string): Tag {
    const tag = this.tags[tagName];

    if (tag === undefined) {
      return { exists: false, value: '' };
    }

    return { exists: true, value: tag };
  }
}

export interface Tag {
  exists: boolean,
  value: string | true
}

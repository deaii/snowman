import type { TemplateFunction } from 'ejs';
import type { StoryState } from './State';

const PASSAGE_REGEX = /^(\s*#!({(.|\n)*?})!#)?((.|\n)*)/i;
const META_GROUP = 2;
const PASSAGE_TEXT_GROUP = 4;

export function extractMeta(text: string): PassageMetadata {
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
export type TitleFunc = (passage: Passage, state: StoryState) => string;
export type Title = string | TitleFunc;

export default interface Passage {
  /**
   * The unique identifier
   */
  readonly id: string;

  /**
   * Name of the passage, as specified in Twine
   */
  readonly name: string;

  /**
   * The displayed title of the passage.  This can be overridden by the
   * constructor.
   */
  readonly title: Title;

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
  readonly meta: PassageMetadata;

  readonly text: string;

  template?: TemplateFunction;
}

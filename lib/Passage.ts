/**
 * An object representing a passage. The current passage will be `window.passage`
 *
 * @class Passage
 */

import unescape from 'lodash/unescape';
import escape from 'lodash/escape';
import template from 'lodash/template';
import marked from 'marked';

const LINK_REGEX = /(\{([^\n}'"]*)})?\[\[(.*?)(\|(.*?))?\s*(\{.*\})?\]\]/gi;
const LINK_TRIM_REGEX = /\s{2,}/gmi;
const STYLE_GROUP = 2;
const DISPLAY_GROUP = 3;
const PASSAGE_NAME_GROUP = 5;
const JSON_GROUP = 6;

const PASSAGE_REGEX = /^(\s*#!({(.|\n)*?})!#)?((.|\n)*)/i;
const META_GROUP = 2;
const PASSAGE_TEXT_GROUP = 4;

export class Passage {

  /**
   * The unique identifier
   */
  id: string;

  /**
   * Name of the passage.
   */
  name: string;

  /**
   * Tags.  May be specified as an attribute, or in the meta object in the
   * passage.
   */
  tags: string[];

  #meta?: {[key: string]: any} | null;

  #text?: string;

  /**
   * The full source code of the passage, after HTML-decoding.
   */
  #source: string;

  /**
   * The text of the passage, after the meta hashbang is removed.
   */
  get text(): string {
    if (!this.#text) {
      const {text, meta} = extractMeta(this.#source);
      this.#text = text;
      this.#meta = meta ? JSON.parse(meta) : null;
      this.#source = '';
    }

    return this.#text;
  }

  /**
   * A JSON object parsed from the meta hashbang.
   */
  get meta(): {[key: string]: any} | null {
    if (!this.#text) {
      const {text, meta} = extractMeta(this.#source);
      this.#text = text;
      this.#meta = meta ? JSON.parse(meta) : null;
      this.#source = '';
    }

    return this.#meta; 
  }

  constructor(id: string, name: string, tags: string[], source: string) {
    /**
     * @property {number} id - id number of passage
     * @type {number}
     */

    this.id = id || '1';

    /**
     * @property {string} name - The name of passage
     * @type {string}
     */

    this.name = name || 'Default';

    /**
     * @property {Array} tags - The tags of the passage.
     * @type {Array}
     */

    this.tags = tags || [];

    /**
     * @property {string} source - The passage source code.
     * @type {string}
     */
    this.#source = unescape(source);
  }

  render() {
    return Passage.renderSource(this.text, this.meta);
  }

  static renderSource(source: string, meta?: {[key: string]: any}){
    // Test if 'source' is defined or not.  If not defined, return an empty
    // string.
    if (!(typeof source !== 'undefined' && source !== null)) {
      return '';
    }

    let result = '';

    result = template(source)({ 
      s: window.story.state, 
      m: meta,
      _: window._,
      $: window.$
    });

    /* [[links]] with or without extra markup {#id.class} */
    result = result.replace(LINK_REGEX, function (...args: string[]) {
      const style = args[STYLE_GROUP];
      const display = args[DISPLAY_GROUP];
      const passage = args[PASSAGE_NAME_GROUP] ?? display;
      const json = args[JSON_GROUP];

      return `
        <a href="javascript:void(0)"
           data-passage="${escape(passage)}
           data-formdata="${escape(json)}"
           ${renderAttrs(style)}
        >
          ${escape(display)}
        </a>`.replace(LINK_TRIM_REGEX, ' ');
    });

    // Prevent template() from triggering markdown code blocks
    // Skip producing code blocks completely
    const renderer = new marked.Renderer();
    renderer.code = function (code) {
      return code;
    };

    marked.setOptions({ smartypants: true, renderer: renderer });
    let newResult = marked(result);

    // Test for new <p> tags from Marked
    if (!result.endsWith('</p>\n') && newResult.endsWith('</p>\n')) {
      newResult = newResult.replace(/^<p>|<\/p>$|<\/p>\n$/g, '');
    }

    return newResult;
  }
}

/**
 * An internal helper function that converts markup like #id.class into HTML
 * attributes.
 *
 * @function renderAttrs
 * @private
 * @param {string} attrs - an attribute shorthand, i.e. #myId.className. There are
 *  two special leading prefixes: - (minus) will hide an element, and 0 will
 *  give it a href property that does nothing.
 * @returns {string} HTML source code
 **/
 function renderAttrs(attrs: string): string {
  var result = '';

  for (var i = 0; attrs[i] === '-' || attrs[i] === '0'; i++) {
    switch (attrs[i]) {
      case '-':
        result += 'style="display:none" ';
        break;

      case '0':
        result += 'href="javascript:void(0)" ';
        break;
    }
  }

  var classes = [];
  var id = null;
  /* eslint-disable no-useless-escape */
  var classOrId = /([#\.])([^#\.]+)/g;
  /* eslint-enable no-useless-escape */
  var matches = classOrId.exec(attrs);

  while (matches !== null) {
    switch (matches[1]) {
      case '#':
        id = matches[2];
        break;

      case '.':
        classes.push(matches[2]);
        break;
    }

    matches = classOrId.exec(attrs);
  }

  if (id !== null) {
    result += 'id="' + id + '" ';
  }

  if (classes.length > 0) {
    result += 'class="' + classes.join(' ') + '"';
  }

  return result.trim();
}

function extractMeta(text: string): {text: string, meta?: string} | null {
  const match = text.match(PASSAGE_REGEX);

  if (match == null) {
    return null;
  }

  return {
    text: match[PASSAGE_TEXT_GROUP],
    meta: match[META_GROUP]
  };
}

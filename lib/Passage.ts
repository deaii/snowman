/**
 * An object representing a passage. The current passage will be `window.passage`
 *
 * @class Passage
 */

import marked from 'marked';

import _unescape from 'lodash/unescape';
import _escape from 'lodash/escape';
import _template from 'lodash/template';

const LINK_REGEX = /(\{([^\n}'"]*)})?\[\[(.*?)(\|(.*?))?\s*(\{.*\})?\]\]/gi;
const LINK_TRIM_REGEX = /\s{2,}/gmi;
const STYLE_GROUP = 2;
const DISPLAY_GROUP = 3;
const PASSAGE_NAME_GROUP = 5;
const JSON_GROUP = 6

const PASSAGE_REGEX = /^(\s*#!({(.|\n)*?})!#)?((.|\n)*)/i;
const META_GROUP = 2;
const PASSAGE_TEXT_GROUP = 4;

export type PassageTags = { [tag: string]: string | true };
export type PassageMetadata = { [key: string]: any };

export class Passage {

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
    } else {
      return this.title;
    }
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
    const source = _unescape(passageEl.innerHTML)

    // We can supply the original source as a readonly string for debug purposes, but generally this only takes up unneeded memory.
    this.source = preserveSource ? source : '';

    // Extract metadata
    const { text, meta: metaStr } = extractMeta(this.source);
    this.text = text;
    const meta = this.meta = !!metaStr
      ? new Function(`return (${metaStr});`)()
      : {}

    // Extract passage title
    const metaTitle = meta['title'];
    if (typeof metaTitle === 'function') {
      this.#titleFunc = metaTitle.bind(this);
      this.title = '';
    } else if (typeof metaTitle === 'string') {
      this.title = metaTitle;
    } else {
      this.title = name ?? '[unnamed]';
    }

    this.id = meta['id'] ?? id ?? 1

    this.tags = {
      ...tags,
      ...(meta['tags'] ?? {})
    };
  }

  render() {
    return Passage.renderSource(this.text, this.tags, this.meta);
  }

  static renderSource(
    source: string,
    tags?: PassageTags,
    meta?: { [key: string]: any },
  ) {
    // Test if 'source' is defined or not.  If not defined, return an empty
    // string.
    if (!(typeof source !== 'undefined' && source !== null)) {
      return '';
    }

    let result = '';

    result = _template(source)({
      s: window.story.state,
      m: meta,
      _: window._,
    });

    if (tags && tags['html']) {
      return result;
    }

    return renderMarkdown(result.trim());
  }

  getTag(tagName: string): Tag {
    var tag = this.tags[tagName];

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

function extractMeta(text: string): PassageMetadata {
  const match = text.match(PASSAGE_REGEX);

  if (match == null) {
    return { text: "", meta: "" }
  }

  return {
    text: match[PASSAGE_TEXT_GROUP] ?? "",
    meta: match[META_GROUP] ?? ""
  };
}

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
function renderAttrs(attrs?: string | null): string {
  if (!attrs) {
    return '';
  }

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
  var classOrId = /([#.])([^#.]+)/g;
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

function renderMarkdown(result: string): string {
  if (!result) {
    return '';
  }

  /* [[links]] with or without extra markup {#id.class} */
  result = result.replace(LINK_REGEX, function (...args: string[]) {
    const style = args[STYLE_GROUP];
    const display = args[DISPLAY_GROUP];
    const passage = args[PASSAGE_NAME_GROUP] ?? display;
    const json = args[JSON_GROUP];

    return `
      <link
      <a href="javascript:void(0)"
         data-passage="${_escape(passage)}
         data-formdata="${_escape(json)}"
         ${renderAttrs(style)}
      >
        ${_escape(display)}
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

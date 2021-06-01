import { Renderer } from 'marked';

import { escape } from '../lodash';
import renderAttrs from './renderAttrs';

const LINK_REGEX = /(\{([^\n}'"]*)})?\[\[(.*?)(\|(.*?))?\s*(\{.*\})?\]\]/gi;
const LINK_TRIM_REGEX = /\s{2,}/gmi;
const STYLE_GROUP = 2;
const DISPLAY_GROUP = 3;
const PASSAGE_NAME_GROUP = 5;
const JSON_GROUP = 6;

export default function renderMarkdown(result: string): string {
  if (!result) {
    return '';
  }

  /* [[links]] with or without extra markup {#id.class} */
  let newResult = result.replace(LINK_REGEX, (...args: string[]) => {
    const style = args[STYLE_GROUP];
    const display = args[DISPLAY_GROUP] ?? '';
    const passage = args[PASSAGE_NAME_GROUP] ?? display ?? '';
    const json = args[JSON_GROUP] ?? '';

    return /* html */ `
      <game-link
         passage="${escape(passage)}"
         formdata="${escape(json)}"
         ${renderAttrs(style)}
      >
        ${escape(display)}
      </a>`.replace(LINK_TRIM_REGEX, ' ');
  });

  // Prevent template() from triggering markdown code blocks
  // Skip producing code blocks completely
  const renderer = new Renderer();
  renderer.code = (code) => code;

  window.marked.setOptions({ smartypants: true, renderer });
  newResult = window.marked(newResult);

  // Test for new <p> tags from Marked
  if (!result.endsWith('</p>\n') && newResult.endsWith('</p>\n')) {
    newResult = newResult.replace(/^<p>|<\/p>$|<\/p>\n$/g, '');
  }

  return newResult;
}

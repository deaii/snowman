import ejs from 'ejs';

import renderMarkdown from './renderMarkdown';
import type { PassageTags } from '../Passage';
import type Passage from '../Passage';

/* eslint-disable no-param-reassign */
export default function renderPassage(
  passage: string | Passage,
  tags?: PassageTags,
): string {
  let result = '';
  let isHtml = !!tags && !!tags['html'];

  // Test if 'source' is defined or not.  If not defined, return an empty
  // string.
  if (!passage) {
    return result;
  }

  if (typeof passage === 'string') {
    result = ejs.compile(passage)(window.sm.state);
  } else {
    isHtml &&= !!passage.tags && !!passage.tags['html'];

    if (!passage.template) {
      passage.template = ejs.compile(passage.text);
    }

    result = passage.template(window.sm.state);
  }

  if (isHtml) {
    return result;
  }

  return renderMarkdown(result.trim());
}

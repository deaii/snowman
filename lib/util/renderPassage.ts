import renderMarkdown from './renderMarkdown';
import type { PassageTags } from '../Passage';

export default function renderSource(
  source: string,
  tags?: PassageTags,
): string {
  // Test if 'source' is defined or not.  If not defined, return an empty
  // string.
  if (!(typeof source !== 'undefined' && source !== null)) {
    return '';
  }

  let result = '';

  result = window._.template(source)(window.story.state);

  if (tags && tags['html']) {
    return result;
  }

  return renderMarkdown(result.trim());
}

import parseTags from './parseTags';
import Passage, { extractMeta, Title, TitleFunc } from '../Passage';

export default function createPassage(passageEl: Element): Passage {
  let id = passageEl.getAttribute('pid')!;
  let name = passageEl.getAttribute('name')!;
  let tags = parseTags(passageEl.getAttribute('tags'));
  const source = unescape(passageEl.innerHTML);

  // Extract metadata
  const { text, meta: metaStr } = extractMeta(source);
  const meta = metaStr
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    ? new Function(`return (${metaStr});`)()
    : {};

  // Extract passage title callback, if it exists.
  const metaTitle = meta.title;

  let title: Title = name;

  if (typeof metaTitle === 'function') {
    title = metaTitle as TitleFunc;
  } else if (typeof metaTitle === 'string') {
    title = metaTitle;
  }

  name = meta.name ?? name;
  id = meta.id ?? id ?? name ?? '1';
  tags = {
    ...tags,
    ...(meta.tags ?? {}),
  };

  return {
    id, name, tags, title, meta, text,
  };
}

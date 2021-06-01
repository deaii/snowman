import type State from '../State';

import type Passage from '../Passage';
import type { Title } from '../Passage';

export default function renderTitle(
  title: Title,
  passage?: Passage,
  state?: State,
) {
  if (typeof title === 'string') {
    return title;
  }
  return title(
    passage ?? window.sm.passage,
    state ?? window.sm.state,
  );
}

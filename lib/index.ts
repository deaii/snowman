
import type { MarkedOptions } from 'marked';
import type { LoDashStatic } from 'lodash';

import { Story } from './Story';

import './src/b.css';

import { setupComponents } from './components/setup';

declare global
{
  interface Window {
    story: Story;
    formdata: {[key: string]: string};

    // These are loaded by the HTML via CDNJS
    _: LoDashStatic;
    $: JQueryStatic;
    marked: (src: string, options?: MarkedOptions) => string;
  }
}

setupComponents();

function onDocLoad() {
  window.config = {};
  window.formdata = {};

  const storyData = document.querySelector('tw-storydata') as HTMLElement;

  window.story = new Story(storyData);
  document.removeEventListener('load', onDocLoad);
}

function onWinLoad() {
  window.story.start();
  window.removeEventListener('load', onWinLoad);
}

document.addEventListener('load', onDocLoad);
window.addEventListener('load', onWinLoad);

export default 0;
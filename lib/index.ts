import type { MarkedOptions } from 'marked';
import type { LoDashStatic } from 'lodash';

import Story from './Story';

import './src/b.css';

import setupComponents from './components/setupComponents';

declare global {
  interface Window {
    // These are loaded by the HTML via CDNJS
    _: LoDashStatic;
    $: JQueryStatic;
    marked: (src: string, options?: MarkedOptions) => string;
  }
}

setupComponents();

function onDocLoad() {
  const storyData = document.querySelector('tw-storydata') as HTMLElement;

  window.story = new Story(document, storyData);
  document.removeEventListener('load', onDocLoad);
}

function onWinLoad() {
  window.story.start();
  window.removeEventListener('load', onWinLoad);
}

document.addEventListener('load', onDocLoad);
window.addEventListener('load', onWinLoad);

export default 0;

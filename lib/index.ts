
import type { LoDashStatic } from 'lodash';

import { Story } from './Story';

import './src/b.css';
import 'normalize-css/normalize.css';

declare global
{
  interface Window {
    story: any
    marked: any;
    formdata?: {[key: string]: string};
    _: LoDashStatic;
    $: JQuery;
  }
}

$(function () {
  const storyData = document.querySelector('tw-storydata') as HTMLElement;
  const storyPassage = document.querySelector('tw-story') as HTMLDivElement;

  window.story = new Story(storyData, storyPassage);
  window.story.start($('tw-story'));
});

export default 0;

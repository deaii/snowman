
import type { LoDashStatic } from 'lodash';
import lodash from 'lodash';
import { Story } from './Story';

import 'bootstrap/dist/css/bootstrap.css';

import { Config } from './Config';

declare global
{
  interface Window {
    story: Story;
    marked: any;
    formdata: {[key: string]: string};
    config: Config;
    _: LoDashStatic;
  }
}

$(function () {
  window.config = {};
  window.formdata = {};

  window._ = lodash;

  const storyData = document.querySelector('tw-storydata') as HTMLElement;
  const storyPassage = document.querySelector('tw-story') as HTMLDivElement;

  window.story = new Story(storyData, storyPassage);
  window.story.start();
});

export default 0;

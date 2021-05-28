
import type { LoDashStatic } from 'lodash';
import type { MarkedOptions } from 'marked';

import _ from 'lodash';
import $ from 'jquery';
import bootstrap from 'bootstrap';
import marked from 'marked';

import { Story } from './Story';

import { Config } from './Config';
import { setupComponents } from './components/setup';

import './src/b.css';

declare global
{
  interface Window {
    story: Story;
    formdata: {[key: string]: string};
    config: Config;

    _: LoDashStatic;
    $: JQueryStatic;
    marked: (src: string, options?: MarkedOptions) => string;
    bootstrap: any;
  }
}

setupComponents();

function onDocLoad() {
  window.config = {};
  window.formdata = {};
  window._ = _;
  window.$ = $;
  window.marked = marked;
  window.bootstrap = bootstrap;

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

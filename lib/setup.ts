import _ from 'lodash';
import $ from 'jquery';

import type Passage from './Passage';
import type State from './State';
import Engine from './Engine';
import util from './util';
import setupComponents from './components/setupComponents';
import SMEvents from './SMEvents';
import TwineStory, { Story } from './Story';

import 'bootstrap/dist/css/bootstrap.min.css';
import './src/b.css';

declare global {
  interface Window {
    sm: typeof util & {
      events: SMEvents,
      engine: Engine,
      story: Story,
      state: State,
      passage: Passage
      $: typeof $,
      _: typeof _,
    };
  }
}

export default function setup() {
  let storyData: HTMLElement;

  function onDocLoad() {
    document.removeEventListener('load', onDocLoad);

    storyData = document.querySelector('tw-storydata') as HTMLElement;
    const story = new TwineStory(storyData);
    const events = new SMEvents(window);
    const engine = new Engine(story, events);

    window.sm = {
      ...util,
      $,
      _,
      events,
      story,
      engine,
      get state() { return engine.state; },
      get passage() { return engine.passage; },
    };

    setupComponents();
  }

  function onWinLoad() {
    window.removeEventListener('load', onWinLoad);

    // By putting in a one-frame timeout, this will allow custom scripts that
    // trigger on window.load to run before the game starts.
    setTimeout(() => {
      window.sm.engine.start();
    }, 16);
  }

  document.addEventListener('load', onDocLoad);
  window.addEventListener('load', onWinLoad);
}

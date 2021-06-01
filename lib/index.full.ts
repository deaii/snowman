/*
import $ from 'jquery';
import _ from 'lodash';
*/
import setup from './setup';

declare global {
  interface Window {
    // $: typeof $;
    // _: typeof _;
  }
}

// window._ = _;
// window.$ = $;

setup();

export default 0;

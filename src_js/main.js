const $ = window.$;
import Bacon from 'baconjs';
$.fn.asEventStream = Bacon.$.asEventStream;
window.Bacon = Bacon;

import searchApp from './search/';
import animations from './animations';

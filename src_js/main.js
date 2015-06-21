const $ = window.$;
import Bacon from 'baconjs';
$.fn.asEventStream = Bacon.$.asEventStream;
window.Bacon = Bacon;

import './search/';
import './speech';
import './animations';

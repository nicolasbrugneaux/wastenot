import $ from 'jquery';
import Bacon from 'baconjs';
$.fn.asEventStream = Bacon.$.asEventStream;

const $searchTextArea = $( '.js-recipe--search' );
const $searchButton = $( '.js-recipe--search--button' );
const $searchAdvanced = $( '.js-recipe--search--advanced' );

const throttleSearch = $searchTextArea.asEventStream('keyup')
    .map( ev => ev.target.value? ev.target.value.trim() : '' )
    .filter( text => text.length > 2 )
    .throttle( 500 )
    .skipDuplicates();

const searchApi = term => Bacon.fromPromise( $.ajax(`/api/recipes?q=${term}`) );

const suggestions = throttleSearch.flatMapLatest( searchApi );

const subscription = suggestions.subscribe(
    data =>
    {
        console.log( data );
    },
    error =>
    {
        console.log( error );
    }
);

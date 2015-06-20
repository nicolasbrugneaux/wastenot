import { speechListener } from './speech.js';

const $searchAudio = $( '.js-recipe--search--audio' );
const $searchTextArea = $( '.js-recipe--search' );
const $searchButton = $( '.js-recipe--search--button' );
const $searchAdvanced = $( '.js-recipe--search--advanced' );

const throttleSearch = $searchTextArea.asEventStream( 'keyup change' )
    .map( ev => ev.target.value? ev.target.value.trim().toLowerCase() : '' )
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

$searchAudio.bind( 'click', speechListener );

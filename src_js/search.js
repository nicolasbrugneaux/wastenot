import { speechListener } from './speech.js';

const $searchAudio = $( '.js-recipe--search--audio' );
const $searchTextArea = $( '.js-recipe--search' );
const $searchButton = $( '.js-recipe--search--button' );
const $searchAdvanced = $( '.js-recipe--search--advanced' );
const $searchOptions = $( '.js-recipe--search--advanced-options' );
const $searchResults = $( '.js-recipe--results' );


const throttleSearch = $searchTextArea.asEventStream( 'keyup change' )
    .map( ev => ev.target.value? ev.target.value.trim().toLowerCase() : '' )
    .filter( text => text.length > 2 )
    .throttle( 1000 )
    .skipDuplicates();

const searchApi = term =>
{
    let options = '';
    $searchOptions.find( 'input:checked' ).each( ( _, elm ) =>
    {
        options += '&' + encodeURIComponent( elm.value );
    } );

    return Bacon.fromPromise( $.ajax( `/api/recipes?q=${term}${options}` ) );
};

const suggestions = throttleSearch.flatMapLatest( searchApi );

const subscription = suggestions.subscribe(
    data =>
    {
        displayResults( JSON.parse( data.value() ).matches );
    },
    error =>
    {
        displayError();
    }
);

$searchAudio.bind( 'click', speechListener );

$searchAdvanced.bind( 'click', e => $searchOptions.toggleClass('hidden') );


const displayResults = recipes =>
{
    const html = recipes.map( recipe =>
    {
        const image = recipe.imageUrlsBySize[
            Object.keys( recipe.imageUrlsBySize ).reduce( ( pre, curr ) =>
            {
                return pre < curr ? curr : pre;
            }, 0 )
        ];
        const name = recipe.recipeName;
        const rating = recipe.rating;

        return (
        `<div class="col-sm-4 col-xs-6">
            <div class="panel panel-default">
              <div><img src="${image.replace('s90-', 's360-')}" class="img-responsive"></div>
              <div class="panel-body">
                <h4>${name}</h4>
              </div>
            </div>
          </div>`
        );
    } );

    $searchResults.html( $( html.join( '' ) ) );
};

const displayError = () =>
{

};

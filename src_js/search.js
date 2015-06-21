import { speechListener } from './speech.js';
import { levenshtein, fuzzyMatch } from './utils.js';

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
    let html = recipes.map( recipe =>
    {
        const image = recipe.imageUrlsBySize[
            Object.keys( recipe.imageUrlsBySize ).reduce( ( pre, curr ) =>
            {
                return pre < curr ? curr : pre;
            }, 0 )
        ];
        const name = recipe.recipeName;
        const rating = recipe.rating;

        const existingIngredients = $searchTextArea.val().toLowerCase().trim().split(' ');

        let missingIngredients = [];
        recipe.ingredients.forEach( ingredient =>
        {
            const _ingredient = ingredient.toLowerCase().trim();

            const shouldPush = existingIngredients.every( existing =>
            {
                let largest, shortest;

                if ( _ingredient.length > existing.length )
                {
                    largest = _ingredient;
                    shortest = existing;
                }
                else
                {
                    largest = existing;
                    shortest = _ingredient;
                }

                const l = _ingredient === existing || largest.indexOf( shortest ) > -1;

                return !l;
            } );

            if ( shouldPush )
            {
                missingIngredients.push( _ingredient );
            }
        } );


        const missingIngredientsString = missingIngredients.map( ingredient => {
            return `<span class='label label-primary' style="display:inline-block">${ingredient}</span>`;
        } ).join('&nbsp;');

        return (
        `<div class="col-sm-4 col-xs-6">
            <div class="panel panel-default">
              <div><img src="${image.replace('s90-', 's360-')}" class="img-responsive"></div>
              <p>Missing ingredients</p>
              <p>${missingIngredientsString}</p>
              <div class="panel-body">
                <h4>${name}</h4>
                <small><button class='btn btn-primary'>Buy missing ingredients</button></small>
              </div>
            </div>
          </div>`
        );
    } );

    html = html.slice( 0, ( Math.floor( ( html.length - 1 ) / 3 ) * 3 ) - 1 );

    $searchResults.html( $( html.join( '' ) ) );
};

const displayError = () =>
{

};

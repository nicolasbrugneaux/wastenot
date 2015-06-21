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
            return `<span class='label label-warning' style="display:inline-block">${ingredient}</span>`;
        } );

        return (
        `<div class="js-recipe--panel col-sm-4 col-xs-6">
            <div class="panel panel-default">
              <div>
                <img src="${image.replace('s90-', 's360-')}" class="img-responsive"></img>
              </div>
              <div class="panel-body">
                <h4>${name}</h4>
                <small><button class='btn btn-primary'>Buy missing ingredients</button></small>
                <p style="margin-top:15px;">${missingIngredientsString}</p>
              </div>
            </div>
          </div>`
        );
    } ).reduce( ( acc, span, index ) =>
    {
        if ( index === 0 || index === 3 || index === 6 )
        {
            return acc + '<div class="js-recipe--row row">' + span;
        }
        else if ( index === 2 || index === 5 || index === 8  )
        {
            return acc + span + '</div>';
        }
        else if ( index === recipes.length - 1 )
        {
            return acc;
        }
        else
        {
            return acc + span;
        }
    }, '' );

    $searchResults.html( $( html ) );

    $( '.js-recipe--row' ).each( ( _, row ) =>
    {
        const $row = $( row );

        let height;
        $row.find( '.js-recipe--panel' ).each( ( i, el ) =>
        {
            const $el = $( el );
            console.log( height );
            if ( !height || $el.height() > height )
            {
                height = $el.height();
            }
        } );

        $row.find( '.js-recipe--panel' ).each( ( i, el ) =>
        {
            const $el = $( el );
            $el.find( '.panel-body' ).css( 'padding-bottom', (height + 50) - $el.height() );
            $el.css('min-height', height + 50 );
        } );
    } );

};

const displayError = () =>
{

};

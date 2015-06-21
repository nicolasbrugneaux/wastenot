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
            return `<span class='label label-default' style="display:inline-block">${ingredient}</span>`;
        } ).join( '&nbsp;' );

        return (
        `<div class="js-recipe--panel col-sm-4 col-xs-6">
            <div class="panel panel-default">
              <div>
                <img src="${image.replace('s90-', 's360-')}" class="img-responsive"></img>
              </div>
              <div class="panel-body">
                <h4>${name}</h4>
                <small><button class='btn btn-primary js-recipe--checkout'>Buy missing ingredients</button></small>
                <p style="margin-top:15px;">${missingIngredientsString}</p>
                <div class="js-recipe--invite hidden">
                <p>Total amout: <span class="js-recipe--invite-total"></span> euros</p>
                <button class='btn btn-primary js-recipe--invite-btn' data-toggle='modal' data-target="#invite--modal">Invite a friend</button>
              </div>
            </div>
          </div>
          <!-- Modal -->
          <div class="modal fade" id="invite--modal" tabindex="-1" role="dialog" aria-labelledby="invite--modal--label">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 class="modal-title" id="invite--modal--label">Invite a friend for a meal</h4>
                </div>
                <div class="modal-body">
                    <form method="GET" action="/api/twilio/outboundsms">
                    <div class="form-group">
                        <p>Total amout: <span class="js-recipe--invite-total"></span> euros</p>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" name="phone" placeholder="Phone number" required>
                    </div>
                    <div class="form-group">
                        <input type="hidden" class="js-paypal-link hidden form-control" name="body" placeholder="A message for your friend" required>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary">Invite your friend<span class="plural"></span></button>
                    </div>
                </div>
              </div>
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

    const fragment = $( html );
    $searchResults.html( fragment );

    $( '.js-recipe--row' ).each( ( _, row ) =>
    {
        const $row = $( row );

        let height;
        $row.find( '.js-recipe--panel' ).each( ( i, el ) =>
        {
            const $el = $( el );
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


    $( '.js-recipe--checkout' ).bind( 'click', event =>
    {
        const btn = $( event.target );
        const labels = btn.parent().parent().find( '.label' );
        const inviteDiv = btn.parent().parent().find( '.js-recipe--invite' );
        const inviteAmount = fragment.find( '.js-recipe--invite-total, #invite--modal .js-recipe--invite-total' );
        const inviteBtn = inviteDiv.find( '.js-recipe--invite-btn' );
        const link = $( '.js-paypal-link' );

        let invite = false;
        let amount = 0;

        $( '.label' ).addClass( 'disabled--label' );
        labels.removeClass( 'disabled--label' );

        $( '.js-recipe--checkout' ).addClass( 'disabled' );
        btn.removeClass( 'disabled' );

        labels.css( 'cursor', 'pointer' );
        labels.addClass( 'label-info' );
        labels.removeClass( 'label-default' );
        labels.bind( 'click', _event =>
        {
            invite = true;
            const $label = $( _event.target );
            $label.addClass( 'label-warning' );
            $label.removeClass( 'label-info' );

            const item = $label.text().trim()
                .replace( 'fresh', '' )
                .replace( 'sliced', '' )
                .trim()
                .replace( / /g, '+' );

            var image = new Image();

            image.onload = () =>
            {
                $label.addClass('label-success').removeClass('label-warning');
            };

            image.onerror = () =>
            {
                $label.addClass('label-success').removeClass('label-warning');
            };

            $.get( '/api/cart/add?item=' + item, res =>
            {
                image.src = res.url;
                amount += parseFloat( res.price, 10 );
                console.log( amount );
                document.body.appendChild( image );

                link.val( "https://www.paypal.com/cgi-bin/webscr?" +
                           "business=" + escape("nicolas.brugneaux@gmail.com") + "&amp;" +
                           "cmd=_xclick&amp;currency_code=EUR&amp;" +
                           "amount=" + escape(amount) + "&amp;" +
                           "item_name=" + escape("Invitation from Nicolas Brugneaux for dinner."));

                inviteAmount.text(amount);
                inviteDiv.removeClass( 'hidden');
            } );
        } );

        inviteBtn.bind( 'click', _event =>
        {

        } );

        btn.off( 'click' );

        btn.bind( 'click', _event =>
        {
            labels.off( 'click' );

            window.open( 'http://berlin.bringmeister.de/checkout/cart/', "_blank" );
        } );


    } );

};

const displayError = () =>
{

};

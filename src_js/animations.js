$( 'div.login--button' ).on( 'click', function(){
    $( '.login--form' ).removeClass( 'hidden' );
} );


var $Nav = $( '#nav' );

/*
 * scroll and nav placement
 */
$Nav.affix(
{
    offset: {
        top: $( 'header' ).height() - $Nav.height()
    }
} );


$( 'body' ).scrollspy( { target : '#nav' } );

$( '.scroll-top' ).click( function()
{
    $( 'body, html' ).animate( { scrollTop : 0 } , 1000 );
} );

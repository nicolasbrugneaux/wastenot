
$( document ).ready( function()
{
    var $Nav = $( '#nav' );

    /*
     * scroll and nav placement
     */
    $Nav.affix( {
        offset: {
            top: $( 'header' ).height() - $Nav.height()
        }
    } ); 

    $( 'body' ).scrollspy( { target : '#nav' } );

    $( '.scroll-top' ).click( function()
    {
        $( 'body, html' ).animate( { scrollTop : 0 } , 1000 );
    } );

    // $( '#nav .navbar-nav li > a' ).click( function()
    // {
    //     var link = $( this ).attr( 'href' );
        // console.log( link );
        // var posi = $( link ).offset().top + 20;
        // $( 'body, html' ).animate( { scrollTop : posi }, 700 );
    // } )

    /**
     * google maps
     */
    google.maps.visualRefresh = true;

    var map;
    function initialize() 
    {
        var mapOptions = {
                            zoom        : 15,
                            mapTypeId   : google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map( document.getElementById( 'map-canvas' ), mapOptions );

      if( navigator.geolocation ) 
      {
            navigator.geolocation.getCurrentPosition( function( position ) 
            {
                var pos = new google.maps.LatLng( position.coords.latitude,
                                                    position.coords.longitude );

                var infowindow = new google.maps.InfoWindow( {
                                                                map         : map,
                                                                position    : pos,
                                                                content     : 'Location found using HTML5.'
                                                            } );

                map.setCenter( pos );
            }, 
            function() 
            {
                handleNoGeolocation( true );
            } );
      } 
      else 
      {
            handleNoGeolocation( false );
      }
    }

    function handleNoGeolocation( errorFlag ) 
    {
        if ( errorFlag ) 
        {
            var content = 'Error: The Geolocation service failed.';
        } 
        else 
        {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
                        map         : map,
                        position    : new google.maps.LatLng( 60, 105 ),
                        content     : content
        };

        var infowindow = new google.maps.InfoWindow( options );
        map.setCenter( options.position );
    }

    google.maps.event.addDomListener( window, 'load', initialize );
} );

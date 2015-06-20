/* globals google */

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
    var content;
    if ( errorFlag )
    {
        content = 'Error: The Geolocation service failed.';
    }
    else
    {
        content = 'Error: Your browser doesn\'t support geolocation.';
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

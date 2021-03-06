var secrets = require('../../config/secrets');
var RecipeCache = require('../../models/RecipeCache');
var request = require('request');
var twilioLib = require('twilio');
var querystring = require('querystring');
var client = require('twilio')(secrets.twilio.sid, secrets.twilio.token);

exports.inboundSMS = function(req, res, next) {

    var body = req.query.Body;

    getSMSRecipe( body, function( message ){

	    var twiml = new twilioLib.TwimlResponse();

	    twiml.message( message );

	    //Render the TwiML document using "toString"
	    res.header("Content-Type", "text/xml");
	    res.end(twiml.toString());
	    next();

    });

};

function getSMSRecipe( body, done ){

	var url = 'http://api.yummly.com/v1/api/recipes?';
	var query = 'q=' + body;
	var key = query;
	var type = 'multipleRecipes';
	url += query;

	var options = {
		url: url,
		headers: {
			'X-Yummly-App-ID': secrets.yummly.appID,
			'X-Yummly-App-Key': secrets.yummly.appKey
		}
	};

	RecipeCache.findOne( { key: key, type: type }, function(err, cached) {

		if (cached) {

			if ( cached.body && cached.body.matches && cached.body.matches[0] )
			{
				getSMSRecipeDetails( cached.body.matches[0].id, function( recipe ){

					done( recipe );

				});
			} else {
				done( 'Cache Error: ' + JSON.stringify( cached ));
			}
		} else {

			request(options, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					console.log(body);
				}

				var jsonBody = JSON.parse(body);
				jsonBody.wastenotcache = true;

				// Save to cache
				var cache = new RecipeCache({
					key: key,
					type: type,
					body: jsonBody
				});

				cache.save(function(err) {
					if ( jsonBody.matches && jsonBody.matches[0] )
					{
						getSMSRecipeDetails( jsonBody.matches[0].id, function( recipe ){

							done( recipe );

						});
					} else {
						done( 'Save Error: ' + JSON.stringify( cached ));
					}


				});

			});
		}
	});

}

function getSMSRecipeDetails( id, done ){

	var url = 'http://api.yummly.com/v1/api/recipe/';
	var key = id;
	var type = 'singleRecipe';
	url += id;

	var options = {
		url: url,
		headers: {
			'X-Yummly-App-ID': secrets.yummly.appID,
			'X-Yummly-App-Key': secrets.yummly.appKey
		}
	};


	console.log('url', url);

	RecipeCache.findOne( { key: key, type: type }, function(err, cached) {

		if (cached) {
			var recipe = formatSMS( cached.body );
			done( recipe );
		} else {

			request(options, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					console.log('error', error, body);
				}

				console.log( response );
				if ( response.statusCode == 404 )
				{
					console.log('404', error);
					done( 'ID Not Found: ' + id );
				} else {

					console.log('request', body, response.statusCode);

					var jsonBody = JSON.parse(body);
					jsonBody.wastenotcache = true;

					// Save to cache
					var cache = new RecipeCache({
						key: key,
						type: type,
						body: jsonBody
					});

					var recipe = formatSMS( jsonBody );
					cache.save(function(err) {
						done( recipe );
					});

				}

			});
		}
	});

}

function formatSMS( jsonBody ){

	var newline = '%0a';
	newline = '\n';
	var recipe = jsonBody.id + newline;

	for (var i = 0; i < jsonBody.ingredientLines.length; i++) {
		recipe += jsonBody.ingredientLines[i] + newline;
	};

	if ( jsonBody.instructions ){
		recipe += newline + jsonBody.instructions;
	} else {
		recipe += newline + 'Directions: Put all ingredients in a bowl. Mix thoroughly.';
	}

	return recipe;
}

exports.sendSMS = function(req, res, next){

    var phone = req.query.phone;
    var body = req.query.body;

	//Send an SMS text message
	client.sendMessage({

	    to: phone,
	    from: '+4915735982573',
	    body: body

	}, function(err, responseData) { //this function is executed when a response is received from Twilio

	    if (!err) { // "err" is an error received during the request, if any

	        // "responseData" is a JavaScript object containing data received from Twilio.
	        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

	        // res.send(responseData.from + '-' + responseData.to + '-' + responseData.body); // outputs "+14506667788"
	        // next()
            req.flash( 'success', { msg: 'Your message has been sent to ' +
                responseData.to + '.' } );
            res.redirect( '/' );

	    }
	    else
	    {
	    	next(err);
	    }
	});

};

var secrets = require('../../config/secrets');
var RecipeCache = require('../../models/RecipeCache');
var request = require('request');
var querystring = require('querystring');

exports.queryRecipes = function(req, res, next) {

	var url = 'http://api.yummly.com/v1/api/recipes?';
	var query = req._parsedUrl.query;
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
			res.send( JSON.stringify(cached.body) );
			next();
		} else {

			request(options, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					console.log(body);
				}

				res.send(body);

				var jsonBody = JSON.parse(body);
				jsonBody.wastenotcache = true;

				// Save to cache
				var cache = new RecipeCache({
					key: key,
					type: type,
					body: jsonBody
				});

				cache.save(function(err) {
					if (err) {
						console.log(err);
						return next(err);
					} else {
						next();
					}
				});

			});
		}
	});


};

exports.getRecipe = function(req, res, next) {

	var url = 'http://api.yummly.com/v1/api/recipe/';
	var id = req.query.id;
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


	console.log(req);
	console.log('url', url);

	RecipeCache.findOne( { key: key, type: type }, function(err, cached) {

		if (cached) {
			res.send( JSON.stringify(cached.body) );
			next();
		} else {

			request(options, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					console.log('error', error, body);
				}

				if ( response.statusCode == 404 )
				{
					console.log('404', error);
					res.status(404).send(body);
					next(error);
				} else {

					console.log('request', body, response.statusCode);
					res.send(body);

					var jsonBody = JSON.parse(body);
					jsonBody.wastenotcache = true;

					// Save to cache
					var cache = new RecipeCache({
						key: key,
						type: type,
						body: jsonBody
					});

					cache.save(function(err) {
						if (err) {
							console.log(err);
							return next(err);
						} else {
							next();
						}
					});

				}

			});
		}
	});

};
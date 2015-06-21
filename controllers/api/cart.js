var secrets = require('../../config/secrets');
var CartLink = require('../../models/CartLink');


exports.add = function(req, res, next) {

	var item = req.query.item;
	CartLink.findOne( { item: item }, function(err, cached) {

		if (cached) {
			res.send( cached );
			next();
		} else {
			res.send( 'Not found: ' + item );
			next();
		}
	});

};

exports.edit = function(req, res, next) {

	var q = req.query.item;
	var u = req.query.url;
	var p = req.query.price;
	var item = 'sample item';
	var url = 'http://example.com';
	var price = '0.0';
	if (q){
		item = q;
	}

	if (u){
		url = u;
	}

	if (p){
		price = p
	}

	var sample = new CartLink({
		item: item,
		url: u,
		price: price
	});

	sample.save(function(err) {

		res.send( JSON.stringify( sample ))
		if (err) {
			console.log(err);
			return next(err);
		} else {
			next();
		}
	});

};
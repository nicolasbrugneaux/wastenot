var mongoose = require('mongoose');

var cartLink = new mongoose.Schema(
{
    item: String,
    url: String,
    price: String
});

module.exports = mongoose.model('CartLink', cartLink);
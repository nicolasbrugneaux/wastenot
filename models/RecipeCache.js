var mongoose = require('mongoose');

var recipeCacheSchema = new mongoose.Schema(
{
    key: String,
    type: String,
    body: Object
} );

module.exports = mongoose.model('RecipeCache', recipeCacheSchema);

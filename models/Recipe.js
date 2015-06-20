var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema(
{
    ingredients: Array,
    picture: String,
    relatedRecipes: Array
} );

module.exports = mongoose.model('Recipe', recipeSchema);

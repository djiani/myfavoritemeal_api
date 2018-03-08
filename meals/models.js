const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MealSchema = mongoose.Schema({
    name: {type:String, required:true},
    description: String,
    category: {type:String, required:true},
    difficulty: String,
    hands_on: {type: Number, required:true},
    served: {type: Number, required:true},
    ingredients: [String], 
    directions: [String],
    owner: { 
        name: String,
        username: String
    },
    image_url: String
    
});

MealSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        name: this.name || '',
        description: this.description || '',
        category: this.category || '',
        hands_on: this.hands_on || 0,
        served: this.served || 0,
        difficulty: this.difficulty || '',
        ingredients: this.ingredients || [],
        directions: this.directions || [],
        owner: this.owner.name || '',
        username: this.owner.username || '',
        image_url: this.image_url || ''
    };
};


const Meals = mongoose.model('Meals', MealSchema);

module.exports = {Meals};

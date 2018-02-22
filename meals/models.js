const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MealSchema = mongoose.Schema({
    name: {type:String, required:true},
    description: String,
    category: {type:String, required:true},
    hands_on: {type: Number, required:true},
    served: {type: Number, required:true},
    ingredients: [String], 
    directions: [String],
    owner: {type: String, required: true},
    image_url: String
    
});

UserSchema.methods.apiRepr = function() {
    return {
        name: this.name || '',
        description: this.description || '',
        category: this.category || '',
        hands_on: this.hands_on || 0,
        served: this.served || 0,
        ingredients: this.ingredients || [],
        directions: this.directions || [],
        owner: this.directions || '',
        image_url: this.image_url || ''
    };
};


const Meals = mongoose.model('Meals', UserSchema);

module.exports = {Meals};

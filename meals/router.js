const express = require('express');
const bodyParser = require('body-parser');


const {Meals} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['name', 'category', 'hands_on', 'served', 'owner'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['name', 'description', 'category', 'owner', 'image_url'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const numberFields = ['hands_on', 'served'];
    const nonNumberField = numberFields.find(
        field => field in req.body && typeof req.body[field] !== 'Number'
    );

    if (nonNumberField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected Number',
            location: nonNumberField
        });
    }
    


    return Meals.create({
        name,
        description,
        category,
        hands_on,
        served,
        ingredients, 
        direction,
        owne,
        image_url
    })
    .then(meal => {
        return res.status(201).json(meal.apr());
    })
    .catch(err=>{
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
    })
    

});



/************************************************
/*************** Get all meal *******************
/************************************************/
router.get('/', (req, res) => {
    return Meals.find()
        .then(Meals => res.json(Meals.map(meal => meal.apiRepr())))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};

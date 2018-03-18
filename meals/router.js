const express = require('express');
const bodyParser = require('body-parser');


const {Meals} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();


/************************************************
/*************** Get all meal *******************
/************************************************/
router.get('/', (req, res) => {
   return Meals.find()
        .then(meals => res.status(200).json(meals.map(meal => meal.apiRepr())))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/meal/:id', (req, res) => {
     Meals.findOne({_id: req.params.id})
        .then(meal => res.status(200).json({meal}))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:searchTerm', (req, res) =>{
  Meals
  .find({name:{$regex: '.*' + req.params.searchTerm + '.*', $options: 'i' }} )
  .then(meals =>{
    res.status(200).json( meals.map(meal => meal.apiRepr()))
  })
  .catch(err =>{
    res.status(500).json({message: 'Internal server error'});
  })

})


router.get('/mymeal/:searchOwner', (req, res) =>{
  Meals
  .find({'owner.username':{$regex:  '.*' +req.params.searchOwner +'.*' , $options: 'i' }} )
  .then(meals =>{
    res.status(200).json( meals.map(meal => meal.apiRepr()))
  })
  .catch(err =>{
    res.status(500).json({message: 'Internal server error'});
  })

})

// Post to register a new meal
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['name', 'category', 'hands_on', 'served'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['name', 'description', 'category', 'image_url'];
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

    // const numberFields = ['hands_on', 'served'];
    // const nonNumberField = numberFields.find(
    //     field => field in req.body && typeof req.body[field] !== 'Number'
    // );

    // if (nonNumberField) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Incorrect field type: expected Number',
    //         location: nonNumberField
    //     });
    // }
    
    //console.log(req.body);

    return Meals.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        difficulty: req.body.difficulty,
        hands_on: req.body.hands_on,
        served: req.body.served,
        ingredients: req.body.ingredients.map( (ingred, index)=>(ingred.name)), 
        directions: req.body.directions.map( (direct, index) =>(direct.name)),
        owner: req.body.owner,
        image_url: req.body.image_url
    })
    .then(meal => {
        return res.status(201).json(meal.apiRepr());
    })
    .catch(err=>{
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        console.log(err);
        res.status(500).json({code: 500, message: 'Internal server error'});
    })
    

});






/************************************************
************** Update meal *******************
/***********************************************/
router.put('/:id', jsonParser, (req, res)=>{
  const requiredFields = ['category', 'hands_on', 'served', 'owner'];
  const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    console.log(req.params.id);
    console.log(req.body);
    if(req.params.id !== req.body._id){
      const message =  `Request path id (${req.params.id}) and request body id (${req.body._id}) must match`;
      console.error(message);
      return res.status(400).send(message);

    }
    
    const mealUpdate = {
          'id': req.body._id,
          'name': req.body.name,
          'description': req.body.description,
          'category': req.body.category,
          'difficulty': req.body.difficulty,
          'hands_on': req.body.hands_on,
          'served': req.body.served, 
          'ingredients': req.body.ingredients,
          'directions': req.body.directions,
          'owner': req.body.owner,
          'image_url': req.body.image_url
        }
    Meals.updateOne({_id: req.body._id}, mealUpdate, function(err, res){
      if(err) throw err;
      console.log('successfully update meal');
    });

    return res.status(204).json({"message":"success"});

})


/************************************************
/*************** delete meal *******************
/***********************************************/

router.delete('/:id', (req, res) => {
  console.log('About to remove this meal: '+req.params.id+ 'from the database!!!!')
  Meals.remove({"_id": req.params.id})
  .then(status =>{
    res.status(204).json({id: req.params.id});

  })
  .catch(err =>{
    res.status(500).json({message:'Internal server error'});
  })
 
})


module.exports = {router};

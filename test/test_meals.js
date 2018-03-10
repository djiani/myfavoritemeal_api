const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const {app, runServer, closeServer} = require('../server');
const {Meals} = require('../meals');
const {TEST_DATABASE_URL} = require('../config');


const expect = chai.expect;

chai.use(chaiHttp);


function seedMealData(){
  console.info('seeding meals data');
  const seedData = [];
  for (let i=0; i<10; i++){
    seedData.push(generateMealsData());
  }
  return Meals.insertMany(seedData);
}

function generateMealsData(){
  return { 
    name: faker.lorem.word(),
    description: faker.lorem.sentence() ,
    category: faker.random.arrayElement(['breakfast', 'lunch', 'dinner']),
    difficulty: faker.random.arrayElement(['easy', 'intermediare', 'hard']),
    hands_on: faker.random.number(120),
    served: faker.random.number(10),
    ingredients: ['ingredients 1', 'ingredients 2', 'ingredients 2'], 
    directions: ['step 1', 'step 2', 'step 3'],
    owner: { 
        name: faker.name.lastName(),
        username: faker.random.arrayElement(['sam', 'patrick', 'job']),
    },
    image_url: faker.image.imageUrl
  }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('myfavorite meal api', function(){

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedMealData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('Get', function(){
    it('should return all existing Meals', function(){
      let res;
      return chai.request(app)
      .get('/api/meals')
      .then(_res => {
        res = _res;
        expect(res).to.have.status(200);
        expect(res.body).to.an('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        return Meals.count();
      })
      .then( count => {
        expect(res.body).to.have.lengthOf(count);
      })
    })

    it('it should return all meal for a given owner', function(){
      let username = 'sam'
      return chai.request(app)
      .get('/api/meals/meal' + username)
      .then(res =>{
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
      })
    })

    it('it should search for the first meal in the list', function(){
      let id;
      return chai.request(app)
      .get('/api/meals/')
      .then(res =>{
        id = res.body[0].id
        return chai.request(app)
        .get('/api/meals/meal/'+id)
        .then(res =>{
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.meal._id).to.equal(id);
        })
      })
    })
  })

  /********************************************************
  *                       POST                            *
  ********************************************************/
  describe('POST', function(){
    let newMeal = {
    "name": "new meal added",
    "description": "short description",
    "category": "dinner",
    "hands_on": 20,
    "served": 4,
    "difficulty": "easy",
    "ingredients": [
        "tomato",
        "oinions"
    ],
    "directions": [
        "step1",
        "ste2"
    ],
    "owner": "userName",
    "username": "sam",
    "image_url": "https://www.kroger.com/asset/5a74b5d984ae789fcdcb6044?data=1"
    }
      
    it('should create a new meal', function(){
      return chai.request(app)
      .post('/api/meals')
      .send(newMeal)
      .then(res =>{
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        return Meals.findOne({_id:res.body.id})
      })
      .then(data =>{
        expect(data).to.be.not.empty;
      })
    })
  })

  /********************************************************
  *                       PUT                            *
  ********************************************************/

  describe('PUT', function(){
    let updateMeal = {
    "name": "update meal added",
    "description": "short description",
    "category": "lunch",
    "hands_on": 10,
    "served": 4,
    "difficulty": "easy",
    "ingredients": [
        "tomato",
        "oinions"
    ],
    "directions": [
        "step1",
        "ste2"
    ],
    "owner": "userName",
    "username": "sam",
    "image_url": "https://www.kroger.com/asset/5a74b5d984ae789fcdcb6044?data=1"
    }

    it('should update the name, category, and hands_on', function(){
      return chai.request(app)
      .get('/api/meals')
      .then(res =>{
        updateMeal.id = res.body[0].id;
        return chai.request(app)
        .put('/api/meals/'+ res.body[0].id)
        .send(updateMeal)
      })
      .then(res =>{
        expect(res).have.status(204)
      })
    })
  })

  /********************************************************
  *                       DELETE                          *
  ********************************************************/
  describe('DELETE', function(){
    it('should delete the first meal in the list', function(){
      let id;
      return chai.request(app)
      .get('/api/meals')
      .then(function(res){
        let id = res.body[0].id;
        return chai.request(app)
        .delete('/api/meals/'+res.body[0].id);
      })
      .then(function(res){
        expect(res).to.have.status(204);
      })
        
    })
  })
});
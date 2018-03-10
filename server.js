require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');
const uuid = require('uuid');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');


const {PORT, DATABASE_URL, CLIENT_ORIGIN, ACCESS_KEY_ID, 
    SECRET_ACCESS_KEY, S3_BUCKET, JWT_SECRET, JWT_EXPIRY} = require('./config');


const {router: usersRouter} = require('./users');
const {router: mealRouter} = require('./meals');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

mongoose.Promise = global.Promise;

const app = express();


// Logging
app.use(morgan('common'));
app.use(bodyParser.json());

app.use(
    cors({
        origin: [CLIENT_ORIGIN]
    })
);

//initial endpoint at the base of the app to log the index.html file
app.get('/', (req, res) => {
  console.log('test running app');
  res.sendFile(__dirname + '/views/index.html');
});

app.use(passport.initialize());
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/meals/', mealRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);


// A protected endpoint which needs a valid JWT to access it
app.get(
    '/api/protected',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        return res.json({
            data: 'rosebud'
        });
    }
);

aws.config.update(
    {accessKeyId: ACCESS_KEY_ID, 
    secretAccessKey: SECRET_ACCESS_KEY,
    region: "us-west-2"
})
const s3 = new aws.S3();
// create the multer object, defining a filter for file extension and storage rules
const upload = multer({
  // verify file extension (this doesn't protect against fake extensions!)
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpe?g|png|gif)$/i.test(file.mimetype)) {
      return cb(new Error('File type not supported!'), false);
    }
    cb(null, true);
  },
  // define storage rules using multerS3
  storage: multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname});
    },
    key: (req, file, cb) => {
      const extension = file.mimetype.split('/').pop();
      cb(null, `products/${Date.now().toString()}.${extension}`);
    }
  })
}).single('file');

app.post('/api/test-upload', (request, response) => {
  upload(request, response, error => {
    if (error) {
      return response.status(400).send(error);
    }
    return response.status(200).send(request.file);
  });
});


// app.post('/api/upload/:filename', (req, res) => {
  
//   let url;
//   const s3 = new aws.S3();
//   console.log(req.params)
//   const fileName = req.body.filename;
//   const filepath = req.body.filepath
//   const s3Params = {
//     Bucket: 'awsmyfavoritemeal',
//     Key: filename,
//     Body: fs.createReadStream(filepath),
//     ContentType: 'image/*',
//     ACL: 'public-read'
//   };

//   s3.putObject(s3Params, (err, data) => {
//     if(err){
//       console.log(err);
//       return res.json({message: err});
//     }
//     const returnData = {
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.amazonaws.com/${req.params.filename}`
//     };
//     res.send(JSON.stringify(returnData));
//   })

// });


app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

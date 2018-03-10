exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
exports.DATABASE_URL =
    process.env.DATABASE_URL || global.DATABASE_URL ||
    'mongodb://localhost/myfavoritemealdb';
exports.TEST_DATABASE_URL = (process.env.TEST_DATABASE_URL || 'mongodb://localhost/myfavoritemealdb-test');
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || "samuel"; 
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.ACCESS_KEY_ID = process.env.ACCESS_KEY_ID ;
exports.SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY ;
exports.S3_BUCKET = process.env.S3_BUCKET || "awsmyfavoritemeal"
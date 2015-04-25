/*DB Connection - START*/
var knex = require('knex')({
   client: 'pg',
   connection: {
      host: 'localhost',  // your host
      user: 'Steven', // your database user
      password: '', // your database password
      database: 'Steven',
      charset: 'UTF8_GENERAL_CI'
   }
});

// var knex = require('knex')({
//    client: 'pg',
//    connection: {
//       host: 'ec2-107-22-173-230.compute-1.amazonaws.com/dciha6hf3doant',  // your host
//       user: 'rxaflmyqbqlyjx', // your database user
//       password: 'henP5g6b7Ap1pHYRu6jUTIvOZ9', // your database password
//       database: 'dciha6hf3doant',
//       charset: 'UTF8_GENERAL_CI'
//    }
// });

var bookshelf = require('bookshelf')(knex);

//var conString = "postgres://Steven@localhost/Steven";
//var conString = "postgres://rxaflmyqbqlyjx:henP5g6b7Ap1pHYRu6jUTIvOZ9@ec2-107-22-173-230.compute-1.amazonaws.com/dciha6hf3doant";
module.exports.DB = bookshelf;
/*DB Connection - END*/
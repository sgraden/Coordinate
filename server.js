var newrelic = require('newrelic');
var express = require('express');
var pg = require('pg');
var ejs = require('ejs');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var favicon = require('serve-favicon');

var model = require('./model');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 


// /*DB Connection - START*/
// var config = {
//    host: 'localhost',  // your host
//    user: 'Steven', // your database user
//    password: '', // your database password
//    database: 'Steven',
//    charset: 'UTF8_GENERAL_CI'
// };

// //For Heroku
// // var config = {
// // 	host: 'ec2-107-22-173-230.compute-1.amazonaws.com/dciha6hf3doant',  // your host
// // 	user: 'rxaflmyqbqlyjx', // your database user
// // 	password: 'henP5g6b7Ap1pHYRu6jUTIvOZ9', // your database password
// // 	database: 'dciha6hf3doant',
// // 	charset: 'UTF8_GENERAL_CI'
// // }
// // 

// var DB = Bookshelf.initialize({
//    client: 'pg', 
//    connection: config
// });

// module.exports.DB = DB;

// var user = DB.Model.extend({
//    tableName: 'tblUSER',
//    idAttribute: 'UserID'
// });

// module.exports = {
//    user: user
// };

var conString = "postgres://Steven@localhost/Steven";
// //var conString = "postgres://rxaflmyqbqlyjx:henP5g6b7Ap1pHYRu6jUTIvOZ9@ec2-107-22-173-230.compute-1.amazonaws.com/dciha6hf3doant";

// /*DB Connection - END*/

app.get('/', function (req, res) {
	console.log(req.body);
	res.render('pages/index', 
		{
			page_title: 'Home'
			//username: 'steven'
		});
});

app.post('/event_create', function(req, res) {
	console.log(req.body);
	var v = req.body;
	var inputs = [v.name, v.descr, v.startDate, v.endDate, v.eventLength, 
		v.startTime, v.endTime, v.notifyNum, v.notifyDays, v.notifyEach, v.uuid];
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
	    client.query('INSERT INTO tblEVENT (EventName, EventDesc, EventStartDate, EventEndDate, EventLength, EventStartTime, EventEndTime, NotifyNumParticipant, NotifyDays, NotifyEachParticipant, EventUUID) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);', inputs, function(err, result) {
		    done();

		    if(err) {
		    	return console.error('error running query', err);
	    	}
    		res.send('/availability.html?event_id=' + v.uuid);
		});
	});
});

app.get('/availability', function(req, res) {
	pg.connect(conString, function(err, client, done) {
		//console.log(req.query.event_id);
		if(err) {
			return console.error('error fetching client from pool', err);
		}
	    client.query('SELECT * FROM tblEvent WHERE EventUUID = $1', [req.query.event_id], function(err, result) {
		    //done();

		    if(err) {
		      return console.error('error running query', err);
	    	}
    		res.json(result.rows);
		});
	});
});

app.post('/user_login', function(req, res) {
	var body = req.body;
	console.log(body);
	
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
	    client.query('SELECT userfname, userlname, pvalue, svalue FROM tbluser u JOIN tblP p ON u.pid = p.pid JOIN tblS s ON u.sid = s.sid WHERE useremail = $1 AND pvalue = $2', [body.email, body.pass], function(err, result) {
		    console.log(result);
		    if(err) {
		      return console.error('error running query', err);
	    	}
	    	if (result) {
		    	var topResult = result.rows[0];
		    	res.send(topResult.userfname);
			}
		});
	});	

});

app.post('/user_signup', function(req, res) {
	var body = req.body;
	
	pg.connect(conString, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
	    client.query('INSERT INTO tblp (pvalue) VALUES ($1); INSERT INTO tbls (svalue) VALUES($2); INSERT INTO tbluser (pid, sid, userfname, userlname, useremail, userbirthdate, usergender, fullaccount) VALUES((SELECT pid FROM tblP$1, $2, $3, $4, $5, $6);', [body.email, body.pass], function(err, result) {
		    console.log(result);
		    if(err) {
		      return console.error('error running query', err);
	    	}
	    	if (result) {
		    	var topResult = result.rows[0];
		    	res.send(topResult.userfname);
			}
		});
	});	

});

/// catch 404 and forwarding to error handler
// app.use(function(req, res, next) { //Was capturing normal page
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/assets/images/logoSmall.png')); //Favicon?



app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});


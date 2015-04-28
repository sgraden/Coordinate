var newrelic = require('newrelic');
var express = require('express');
var session = require('express-session')
var RedisStore = require('connect-redis')(session);
var url = require('url')
var pg = require('pg');
var mysql = require('mysql');
var ejs = require('ejs');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var favicon = require('serve-favicon');

// var rtg, redis; //Declaring RedisToGo and redis vars
// if (process.env.REDISTOGO_URL) {
// 	rtg   = require("url").parse(process.env.REDISTOGO_URL);
// 	redis = require("redis").createClient(rtg.port, rtg.hostname);

// 	redis.auth(rtg.auth.split(":")[1]);
// } else {
//     redis = require("redis").createClient();
// }
 
/*module.exports = function Sessions(url, secret) {
	var store = new RedisStore({ url: url });
	var session = expressSession({
		secret: 'this_needs_change',
		store: store,
		resave: true,
		saveUninitialized: true
	});

	return session;
};*/

var model = require('./model');
var app = express();

if (process.env.REDISTOGO_URL) { //On heroku using Redis
	console.log("Connecting to redis online");
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);
	var rtgAuth = rtg.auth.split(':');

	console.log("rtg ", rtg);
	app.set('redisHost', rtg.hostname);
	app.set('redisPort', rtg.port);
	app.set('redisDb', rtgAuth[0]);
	app.set('redisPass', rtgAuth[1]);
	console.log('app.set redisDb', app.set('redisPass'));
	app.use(session({
	    store: new RedisStore({
	        host: app.set('redisHost'),
	        port: app.set('redisPort'),
	        db: 0,
	        pass: app.set('redisPass'),
	    }),
	    secret: 'this_needs_environment_variable',
	    resave: false,
	    saveUninitialized: true
	}));
} else { //local system
	console.log("Connecting to local Redis");
	var redis = require("redis").createClient();
	app.use(session({
		store: new RedisStore({
			host: '127.0.0.1',
  			port: 6379
		}),
	    secret: 'this_needs_to_be_changed', //Look at Environment variables
	    resave: false,
	    saveUninitialized: true
	}));
}

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));



// /*DB Connection - START*/

var conn = mysql.createConnection({
	host     : 'localhost',
	database : 'coordinate',
	user     : 'root',
	password : 'Magnitude_9'
});

//Connect to the heroku instance
/*var conn = mysql.createConnection({
	host     : 'us-cdbr-iron-east-02.cleardb.net',
	database : 'heroku_d015497bbaaf387',
	user     : 'b18e443b2960cf',
	password : '1a13ae39'
});*/

var sess;

// /*DB Connection - END*/

app.get('/', function (req, res) { //When browser directed to / (main index)
	sess = req.session;
	console.log('Index Session: ', sess);
	var data = {page_title: 'Home'};
	if (sess.userid) {
		data.username = sess.userfname;
	} 
	res.render('pages/index', data);
});


//User Login
app.post('/user_login', function(req, res) {
	var body = req.body;

	sess = req.session;
	console.log('Login Session: ', sess);
	conn.query({
		sql:'SELECT userid, userfname, userlname FROM tbluser u JOIN tblP p ON u.pid = p.pid JOIN tblS s ON u.sid = s.sid WHERE useremail = ? AND pvalue = ? LIMIT 1',
		values: [body.email, body.pass]
	}, function(err, results, fields) {
		if(err) {
	    	return console.error('error running query', err);
    	}
    	if (results) {
    		sess.userid = results[0].userid;
    		sess.userfname = results[0].userfname;
    		//console.log('Login Session', sess);
	    	res.json([{userfname: '' + results[0].userfname}]);	
		}
	});
});

//User signup
app.post('/user_signup', function(req, res) { //Need to check if account exists already
	var body = req.body;
	console.log('Signup body', req.body);
	conn.query({
		sql:'CALL sp_new_user(?, ?, ?, ?, ?, ?, ?, ?);',
		values: [body.pvalue, 'salt', body.userfname, body.userlname, body.useremail, '1993-12-11', 'm', 1]
	}, function(err, results, fields) {
		if(err) {
	    	return console.error('error running query', err);
    	}
    	if (results) {
    		/* Returned from Query
    		[ [ { UserID: 25, userfname: 'asdf' } ],
    		  { fieldCount: 0,
    		    affectedRows: 0,
    		    insertId: 0,
    		    serverStatus: 2,
    		    warningCount: 0,
    		    message: '',
    		    protocol41: true,
    		    changedRows: 0 } ]
    		*/
    		sess = req.session;
    		console.log('signup results', results);
    		sess.userid = results[0][0].userid;
    		sess.userfname = results[0][0].userfname;
    		console.log('Signup Session: ', sess);
	    	res.json([{userfname: '' + results[0][0].userfname}]);
		}
	});

});

//Event Create
app.get('/event_create', function(req, res) {
	sess = req.session;
	var data = {page_title: 'Create Event'};
	if (sess.userfname) { //good you are logged in
		data.username = sess.userfname;
		res.render('pages/event_create', data);
	} else {
		res.redirect('/');
	}
});
app.post('/event_create', function(req, res) {
	//console.log(req.body);
	sess = req.session;

	var v = req.body;
	var inputs = [v.name, v.descr, sess.userid, v.startDate, v.endDate, v.eventLength, 
		v.startTime, v.endTime, v.notifyNum, v.notifyDays, parseInt(v.notifyEach), v.uuid];
		//console.log('event sess participant', typeof parseInt(v.notifyEach));
	conn.query({
		sql:'CALL sp_create_event(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
		values: inputs
	}, function(err, results, fields) {
		if(err) {
	    	return console.error('Event Create error running query', err);
    	}
		res.send('/availability?event_id=' + v.uuid);
	});
});

//Enter availability
app.get('/availability', function(req, res) { //Working on availability. Returns 3 times?
	sess = req.session;
	conn.query({
		sql: 'SELECT * FROM tblEvent WHERE EventUUID = ?',
		values: [req.query.event_id]
	}, function(err, results, fields) {
		console.log('availability results: ', results);
		if (err) {
	      return console.error('error running query', err);
    	}
    	var data = {
    		page_title: 'Availability',
    		event_name: results.EventName,
    		event_desc: results.EventDesc
    	};
    	if (sess.userfname) {
    		data.userfname = sess.userfname;
	    	res.render('pages/availability', data); //Send back the rows here and genereate on EJS page
			//res.json(result.rows);
    	} else {
    		res.redirect('/');
    	}
	});
});

app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/assets/images/logoSmall.png')); //Favicon?

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});


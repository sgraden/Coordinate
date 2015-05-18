/// <reference path="typings/node/node.d.ts"/>
"use strict";
var newrelic   = require('newrelic');
var express    = require('express');
var session    = require('express-session')
var RedisStore = require('connect-redis')(session);
var url        = require('url')
var pg         = require('pg');
var mysql      = require('mysql');
var ejs        = require('ejs');
var passport   = require('passport');
var bcrypt     = require('bcrypt-nodejs');
var favicon    = require('serve-favicon');

var app        = express();

if (process.env.REDISTOGO_URL) { //On heroku using Redis
	console.log("Connecting to redis online");
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname, {no_ready_check: true});
	redis.auth(rtg.auth.split(":")[1]);

	var rtgAuth = rtg.auth.split(':');

	console.log('rtg ', rtg);
	app.set('redisHost', rtg.hostname);
	app.set('redisPort', rtg.port);
	app.set('redisDb', rtgAuth[0]);
	app.set('redisPass', rtgAuth[1]);
	app.use(session({
	    store: new RedisStore({
	        host: app.set('redisHost'),
	        port: app.set('redisPort'),
	        db: 0, //does not like the app.set redisDb
	        pass: '6e2176b82e5a57a64090f85d48990a90',
	    }),
	    secret: 'this_needs_environment_variable',
	    resave: false,
	    saveUninitialized: false
	}));
} else { //local system
	console.log("Connecting to local");
	//var redis = require("redis").createClient();
	app.use(session({
		// store: new RedisStore({
		// 	host: '127.0.0.1',
  // 			port: 6379
		// }),
	    secret: 'this_needs_to_be_changed', //Look at Environment variables
	    resave: false,
	    saveUninitialized: false
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

if (process.env.DB_USER) { 	//Connect to the heroku instance
	var db_config = {
		host     : 'us-cdbr-iron-east-02.cleardb.net',
		database : 'heroku_d015497bbaaf387',
		user     : process.env.DB_USER, //'b18e443b2960cf',
		password : process.env.DB_P//'1a13ae39'
	};
	var conn = mysql.createConnection(db_config);
	handleDisconnect();
} else { //Local system
	var conn = mysql.createConnection({
		host     : 'localhost',
		database : 'coordinate',
		user     : 'root',
		password : 'Magnitude_9'
	});
}



function handleDisconnect() {
  conn = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  conn.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  conn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

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
    	console.log('login results:', results);
    	if (results.length > 0) {
    		sess.userid = results[0].userid;
    		sess.userfname = results[0].userfname;
    		//console.log('Login Session', sess);
	    	res.json([{userfname: '' + results[0].userfname}]);	
		} else {
			res.send("failed");
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

//User logout
app.post('/user_logout', function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			return console.error('error destroying session', err);
		} else {
			res.send('s');
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
		res.send('/availability?e=' + v.uuid);
	});
});

//Enter availability
app.get('/availability', function(req, res) { //Working on availability. Returns 3 times?
	sess = req.session;
	conn.query({
		sql: 'SELECT u.UserFName, u.UserLName, e.* FROM tblEvent e JOIN tblUSER u ON e.EventCreatorID = u.UserID WHERE EventUUID = ?',
		values: [req.query.e]
	}, function(err, results, fields) {
		//console.log('availability results: ', results);
		if (err) {
	      return console.error('error running query', err);
    	}

    	if (results.length == 0) {
			return console.error('no data found', results);
		} else {
			console.log('availability results', results);
	    	/*var data = {
	    		page_title: 'Availability',
	    		event_name: results[0].EventName,
	    		event_desc: results[0].EventDesc
	    	};*/
	    	//4/1/2015 - 4/5/2015
	    	var startDate  = new Date(results[0].EventStartDate);
	    		var startMonth = startDate.getMonth() + 1; //0-11
	    		var startDay   = startDate.getDate(); //1-31
	    		var startYear  = startDate.getFullYear();
	    	var endDate    = new Date(results[0].EventEndDate);
	    		var endMonth   = endDate.getMonth() + 1;
				var endDay     = endDate.getDate();
	    		var endYear    = endDate.getFullYear();
	    	var data = {
	    		page_title: 'Availability',
	    		userID: sess.userid,
	    		username: sess.userfname,
	    		event_name: results[0].EventName,
	    		event_desc: results[0].EventDesc,
	    		event_creator_fname: results[0].UserFName,
	    		event_creator_lname: results[0].UserLName,
	    		event_length: results[0].EventLength,
	    		event_start_date: startMonth + '/' + startDay + '/' + startYear,
	    		event_end_date: endMonth + '/' + endDay + '/' + endYear
	    	};
	    	if (sess.userfname) { //User is logged in
	    		data.username = sess.userfname;
	    		//console.log('availability data: ', data);
		    	res.render('pages/availability', data);
	    	} else {
	    		res.redirect('/');
	    	}
	    }
	});
});
app.post('/availability_info', function(req, res) { //maybe switch to get?
	sess = req.session;
	//console.log(req.body.e);
	conn.query({
		sql: 'SELECT * FROM tblEvent WHERE EventUUID = ?',
		values: [req.body.e]
	}, function(err, results, fields) {
		//console.log('availability results: ', results);
		if (err) {
	      return console.error('error running query', err);
    	}
    	if (sess.userfname) {
    		//console.log(results);
			res.json(results);
    	} else {
    		res.redirect('/');
    	}
	});
});
app.post('/availability_submit', function(req, res) { //[eventid, time, startDate, day, preference, userID]
	sess = req.session;
	//console.log(sess);
	//console.log(req.body);
	var elementData = req.body.elementData;
	//console.log(elementData[1]);
	for (var i = 0; i < elementData.length; i++) {
		elementData[i].push(sess.userid);
	}
	console.log(elementData)
	var sql = 'INSERT INTO tblTIME (EventID, StartTime, StartDate, StartDay, Preference, UserID) VALUES ?';
	conn.query(sql, [elementData], function(err, results, fields) {
		if (err) {
	      return console.error('error running query', err);
    	}
    	res.send('ok');
	});
});

app.get('/event_review', function(req, res) { //Working on availability. Returns 3 times?
	sess = req.session;
	conn.query({
		sql: 'SELECT u.UserFName, u.UserLName, e.* FROM tblEvent e JOIN tblUSER u ON e.EventCreatorID = u.UserID WHERE EventUUID = ?',
		values: [req.query.e]
	}, function(err, results, fields) {
		//console.log('availability results: ', results);
		if (err) {
	      return console.error('error running query', err);
    	}
    	if (sess.userid) { //User is logged in
    		console.log("event_review", results);
			var startDate  = new Date(results[0].EventStartDate);
				var startMonth = startDate.getMonth() + 1; //0-11
	    		var startDay   = startDate.getDate(); //1-31
	    		var startYear  = startDate.getFullYear();
			var endDate    = new Date(results[0].EventEndDate);
				var endMonth   = endDate.getMonth() + 1;
				var endDay     = endDate.getDate();
				var endYear    = endDate.getFullYear();
	    	var data = {
	    		page_title: 'Review',
	    		userID: sess.userid,
	    		username: sess.userfname,
	    		event_name: results[0].EventName,
	    		event_desc: results[0].EventDesc,
	    		event_creator_id: results[0].EventCreatorID,
	    		event_creator_fname: results[0].UserFName,
	    		event_creator_lname: results[0].UserLName,
	    		event_length: results[0].EventLength,
	    		event_start_date: startMonth + '/' + startDay + '/' + startYear,
	    		event_end_date: endMonth + '/' + endDay + '/' + endYear
	    	};
	    	res.render('pages/event_review', data);
    	} else {
    		res.redirect('/');
    	}
		
	});
});
app.post('/review_info', function(req, res) {
	conn.query({
		sql: "SELECT u.UserFName, u.UserLName, t.*, e.EventID, e.EventStartTime, e.EventEndTime, e.EventStartDate, e.EventEndDate FROM tblTIME t JOIN tblUSER u ON t.UserID = u.UserID JOIN tblEVENT e on t.EventID = e.EventID WHERE EventUUID = ?",
		values: [req.body.e]
	}, function (err, results, fields) {
		if (err) {
	      return console.error('error running query', err);
    	}
		res.json(results);
	});
});

app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/assets/images/logoSmall.png')); //Favicon?

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});


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
var nodemailer = require("nodemailer");
var sgTransport = require('nodemailer-sendgrid-transport');

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
		password : process.env.DB_P,//'1a13ae39'
		multipleStatements: true
	};
	var conn = mysql.createConnection(db_config);
	handleDisconnect();
} else { //Local system
	var conn = mysql.createConnection({
		host     : 'localhost',
		database : 'coordinate',
		user     : 'root',
		password : 'Magnitude_9',
		multipleStatements: true
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

/* IF on server and able to email */
var client;
if (process.env.SENDGRID_USERNAME) {
	var options = {
	    auth: {
	        api_user: process.env.SENDGRID_USERNAME,
	        api_key: process.env.SENDGRID_PASSWORD
	    }
	}
	client = nodemailer.createTransport(sgTransport(options));
}

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
    		var data = {
    			username: results[0].userfname
    		};
	    	res.json([data]);	
		} else {
			res.status(404).send("Email or login is incorrect");
		}
	});
});

//User signup
app.post('/user_signup', function(req, res) { //Need to check if account exists already
	var body = req.body;
	console.log('Signup body', req.body);
	conn.query({
		sql: 'SELECT UserEmail FROM tblUSER WHERE UserEmail = ?',
		values: [body.useremail]
	}, function (err, results, fields) {
		if(err) {
	    	return console.error('error signing up', err);
    	}
    	console.log('Signup check', results);
		if (results.length == 0) { //If there isn't anything returned
			console.log('yay signup check passed');
			conn.query({
				sql:'CALL sp_new_user(?, ?, ?, ?, ?, ?, ?, ?);',
				values: [body.pvalue, 'salt', body.userfname, body.userlname, body.useremail, '1993-12-11', 'm', 1]
			}, function (err, results, fields) {
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
		    		//console.log('signup results', results);
		    		sess.userid = results[0][0].userid;
		    		sess.userfname = results[0][0].userfname;
		    		//console.log('Signup Session: ', sess);
			    	res.json([{userfname: '' + results[0][0].userfname}]);
				}
			});
		} else {
			res.status(418).send('Email already exists');
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

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

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
	var inputs = [v.name, v.descr, sess.userid, v.startDate, v.endDate, parseFloat(v.eventLength), v.startTime, v.endTime, v.notifyNum, v.notifyDays, v.notifyEach, v.uuid];
		console.log('Event Create', inputs);
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
			console.log('availability', results);
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
	    	console.log('availabilit', data);
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
    		console.log(results);
    		//console.log(results);
			res.json(results);
    	} else {
    		res.redirect('/');
    	}
	});
});
app.post('/availability_submit', function (req, res) { //[eventid, time, startDate, day, preference, userID]
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

app.get('/event_review', function (req, res) { //Working on availability. Returns 3 times?
	sess = req.session;
	if (sess.userid) { //User is logged in
		conn.query({
			sql: 'SELECT u.UserFName, u.UserLName, e.* FROM tblEvent e JOIN tblUSER u ON e.EventCreatorID = u.UserID WHERE EventUUID = ?',
			values: [req.query.e]
		}, function (err, results, fields) {
			//console.log('availability results: ', results);
			if (err) {
		      return console.error('error running query', err);
	    	}
			console.log("event_review", results);
			var startDate  = new Date(results[0].EventStartDate); //May have caused issue with front because server time zone different from local
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
	    		event_end_date: endMonth + '/' + endDay + '/' + endYear,
	    		event_set_date: results[0].EventSetDate
	    	};
	    	res.render('pages/event_review', data);
		});
    } else {
		res.redirect('/');
	}
});
app.post('/review_info', function (req, res) {
	if (req.body.e) {
		conn.query({
			sql: "SELECT u.UserFName, u.UserLName, t.*, e.EventID, e.EventStartTime, e.EventEndTime, e.EventStartDate, e.EventEndDate FROM tblTIME t JOIN tblUSER u ON t.UserID = u.UserID JOIN tblEVENT e on t.EventID = e.EventID WHERE e.EventUUID = ?",
			values: [req.body.e]
		}, function (err, results, fields) {
			if (err) {
		      return console.error('error running query', err);
	    	}
			res.json(results);
		});
	}
});

/*app.get('/view_events', function (req, res) {
	sess = req.session;
	if (sess) { //User is logged in
	    var data = {
	    	page_title: "View Events",
	    	username: sess.userfname,
	    };
    	res.render('pages/view_events', data);
	}
});*/
app.get('/view_events', function (req, res) { //Load up the user list of events 
	sess = req.session;
	if (sess.userid) { //User is logged in
		conn.query({
			sql: 'SELECT e.EventName, e.EventDesc, e.EventStartDate, e.EventEndDate, e.EventUUID FROM tblUSER u JOIN tblEVENT e ON u.UserID = e.EventCreatorID WHERE e.EventCreatorID = ? ORDER BY e.EventStartDate DESC; SELECT DISTINCT e.EventName, e.EventCreatorID, e.EventDesc, e.EventStartDate, e.EventEndDate, e.EventUUID FROM tblUSER u JOIN tblTime t ON u.UserID = t.UserID JOIN tblEVENT e ON t.EventID = e.EventID WHERE t.UserID = ? AND e.EventCreatorID != ?;',
			values: [sess.userid, sess.userid, sess.userid]
		}, function (err, results, fields) {
			//console.log('view_events results: ', results);
			if (err) {
		      return console.error('error running query', err);
	    	}
    		//console.log("event_review", results);
		    var data = {
		    	page_title: "View Events",
		    	username: sess.userfname,
		    	events: results
		    };
	    	res.render('pages/view_events', data);
		});
	} else {
		res.redirect('/');
	}
});

app.post('/share_event', function (req, res) {
	//console.log('share event', req);
	sess = req.session;
	if (sess.userid) { //User is logged in
		console.log('hasdfasdf', req.body);
		conn.query({
			sql: 'SELECT u.UserFName, u.UserLName, e.EventName, e.EventLength, e.EventUUID FROM tblUSER u JOIN tblEVENT e ON u.UserID = e.EventCreatorID WHERE e.EventID = ? AND u.UserID = ?',
			values: [req.body.eventID, sess.userid]
		}, function (err, results, fields) {
			//console.log('share_event results: ', results);
			if (err) {
		      return console.error('error running query', err);
	    	}
	    	var emailList = req.body.emails;
	    	//for (var i = 0; i < emailList.length; i++) {
	    	var info = results[0];
	    	if (emailer('team@coordinate.tody', emailList, info.UserFName + " " + info.UserLName, info.EventName, info.EventUUID)) {
	    		res.status(200).send('Email(s) sent');
	    	} else {
	    		res.status(500).send('Something went wrong. Try again later.');
	    	}
		});
	}
});

var emailer = function (fromEmail, toEmailList, inviterName, eventName, eventUUID) {
	var email = {
		from: fromEmail,
		to: toEmailList.join(', '),
		subject: 'An Event from ' + inviterName + '@Coordinate',
		html: "<!DOCTYPE html><head><title>Email to Invite</title><link rel='stylesheet' type='text/css' href='styles.css'><link href='http://fonts.googleapis.com/css?family=Lato:300,400' rel='stylesheet' type='text/css'></head><body font-family: lato; style='margin:0; padding: 0;'><table align='center' border='0' cellpadding='0' cellspacing='0' width='100%'><tr style='background-color: #c2dfa6'><td align='center' style='width: 20%; padding-top: 20px;'><img src='http://www.coordinate.today/assets/images/logo.png' alt='Coordinate logo' width = '50%' style='padding-bottom:20px'></td></tr></table><table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td style='padding-top:30px;'>You have been invited to " + eventName + " by " + inviterName + ". Please click the link below to insert your availability to attend this event. </td></tr><tr><td align='center' style='padding-top: 25px; padding-bottom: 25px;'><a href='www.coordinate.today/availability?e='" + eventUUID + "'>www.coordinate.today/availability</td></tr><tr><td>We will inform you when the event has been scheduled. </td></tr></table></td></tr><tr style='background-color: #118c4e'><td>Please visit <a href='http://www.coordinate.today'><font color='#ffffff'>Coordinate.today</a></font> to create your own event.</td></tr></table></body</html>"
	};
	 
	return client.sendMail(email, function(err, info){
	    if (err ){	
	      console.log(error);
	      return false;
	    }
	    else {
	      console.log('Message sent: ' + info);//info.response); //Blank?
	      return true;
	    }
	});
}

app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/assets/images/logoSmall.png')); //Favicon?

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});


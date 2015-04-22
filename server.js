//console.log(process.argv);
var newrelic = require('newrelic');
var express = require('express');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

var conString = "postgres://Steven@localhost/Steven";
//var conString = "postgres://rxaflmyqbqlyjx:henP5g6b7Ap1pHYRu6jUTIvOZ9@ec2-107-22-173-230.compute-1.amazonaws.com/dciha6hf3doant";


app.post('/create_event', function(request, response) {
	console.log(request.body);
	var v = request.body;
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
	    		response.redirect('/availability.html?event_id=' + v.uuid);
			});
	});
});

app.get('/event', function(request, response) {
	pg.connect(conString, function(err, client, done) {
		console.log(request.query.event_id);
		if(err) {
			return console.error('error fetching client from pool', err);
		}
	    client.query('SELECT * FROM tblEvent WHERE EventUUID = $1', [request.query.event_id], function(err, result) {
			    done();

			    if(err) {
			      return console.error('error running query', err);
		    	}
	    		response.json(result.rows);
			});
	});
});

app.use(express.static(__dirname + '/public/'));


app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});


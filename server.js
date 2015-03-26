//console.log(process.argv);
require('newrelic');
var express = require('express');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

//app.get('/', function(request, response) {
//	response.send(cool());
//});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});

// Server stuff
/*
var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client) {
	var query = client.query('SELECT * FROM your_table');

	query.on('row', function(row) {
    	console.log(JSON.stringify(row));
	});
});
*/

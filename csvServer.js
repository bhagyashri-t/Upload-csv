
// Module dependancies
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();

//Server port and IP address, working for both locally and openshift server.
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

//Mysql connect configuration, working locally and on the server.
var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
var mysqlPort = process.env.OPENSHIFT_MYSQL_DB_PORT || '3306';

//Connecting to mysql database (local/Server)
if(mysqlHost == 'localhost') {
	mysqlConnection = mysql.createConnection ({
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'csvData'
	});
	console.log('Connected to local database csvData');
} else {
	var mysqlUser = 'adminQA6hpVU' ;
	var mysqlPassword = 'bGSIQQx2SjVr';
	var mysqlDb = 'uploadcsv';
	var mysqlString = 'mysql://' + mysqlUser + ':' + mysqlPassword + '@' + mysqlHost + ':' + mysqlPort + '/' + mysqlDb;
	
	mysqlConnection = mysql.createConnection(mysqlString);
	mysqlConnection.connect(function(error) {
		if (error) {
			console.log(error);
		} else {
			console.log('Connected to server database uploadcsv');
		}
	});
}

app.listen(serverPort, serverIpAddress, function () {
	console.log("Listening on "+ serverIpAddress +", port "+ serverPort);
});

app.use(express.static(__dirname));
console.log(__dirname);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Rendering app on browser
app.get('/', function(request, response) {
	response.send(index.html);
	console.log("showing csvParser.html");
});

//API to post csv data
app.post('/csvData', function(request, response) {

	var rowsToadd = JSON.parse(request.body.array);
	var row;
	
	function sqlCallback (i) {
		return function (error, rows, fields) {
			
				if(error) {
					console.log(error);
				
				} else if(rows.length <= 0) {
					row = {first_name: rowsToadd[i].first_name,
						last_name: rowsToadd[i].last_name,
						add_line1: rowsToadd[i].add_line_1,
						add_line2: rowsToadd[i].add_line_2,
						city: rowsToadd[i].city,
						state: rowsToadd[i].state,
						postal_code: rowsToadd[i].postal_code};
					console.log(row);

					mysqlConnection.query('INSERT INTO users SET ?', row, function(error, rows, fields) {
						if(error) {
							console.log(error);
					
						} else {
							console.log("User Added successfully!");
							console.log(rows);

						}
					});
				} else {

					console.log("User already exists!");
				}
			}	
	}
	

	for (var i = 0; i < rowsToadd.length; i++) {
		var sqlQuery = 'SELECT * FROM users WHERE first_name="'+rowsToadd[i].first_name+'" AND last_name="'+rowsToadd[i].last_name+'"';
		mysqlConnection.query(sqlQuery, sqlCallback(i));
	};
	
	response.send("400");

});

//API to get existing csv data
app.get('/csvData', function(request,response) {

	var sqlQuery = 'SELECT first_name, last_name, add_line1, add_line2, city, state, postal_code FROM users';
	mysqlConnection.query(sqlQuery, function(error, rows) {
		if(error) {
			console.log(error);
			response.json({
				type: false,
				data: "Error: "+ error
			});
		} else {
			console.log(rows);
			response.send(rows);
		}
	});
});


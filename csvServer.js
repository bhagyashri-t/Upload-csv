
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();

var mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'csvData'
});

app.listen(8000, 'localhost', function(){
	console.log('server running on lcalhost:8000');
});

app.use(express.static(__dirname));
console.log(__dirname);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.send(index.html);
	console.log("showing csvParser.html");
});

app.post('/csvData', function(request, response) {

	console.log(request.body.array);
//	console.log(JSON.parse(request.body.array));

	var rowsToadd = JSON.parse(request.body.array);
	var row;
//	console.log(rowsToadd);
/*
	var i = 0;
	row = {first_name: rowsToadd[i].first_name,
				last_name: rowsToadd[i].last_name,
				add_line1: rowsToadd[i].add_line_1,
				add_line2: rowsToadd[i].add_line_2,
				city: rowsToadd[i].city,
				state: rowsToadd[i].state,
				postal_code: rowsToadd[i].postal_code};
	console.log(row);
	console.log(row.first_name);
	console.log(row.last_name);
*/
	
	function sqlCallback (i) {
		return function (error, rows, fields) {
			
				if(error) {
					console.log(error);
		/*				response.json({
						type: false,
						data: "Error :"+ error
					});
		*/				
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

		/*						response.json({
								type: false,
								data: "Error: "+ error
							});
		*/					
						} else {
							console.log("User Added successfully!");
							console.log(rows);
		//						response.send("400");
						}
					});
				} else {
		//				response.send("404");
					console.log("User already exists!");
				}
			}	
	}
	

	for (var i = 0; i < rowsToadd.length; i++) {
		var sqlQuery = 'SELECT * FROM users WHERE first_name="'+rowsToadd[i].first_name+'" AND last_name="'+rowsToadd[i].last_name+'"';
		mysqlConnection.query(sqlQuery, sqlCallback(i));
	};
	
	response.send("404");

});

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


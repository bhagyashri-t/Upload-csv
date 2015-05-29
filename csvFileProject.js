

$(document).ready(function() {
	$('#inputFile').bind('change', uploadCSVFile);
	$('#showUsersBtn').bind('click', showAllUsers);
});

/*
	showAllUsers() :
		This function gets all the users from server and displys them in table.
*/

function showAllUsers() {
	
	var output = '';
	var headers = ['first_name', 'last_name', 'add_line_1', 'add_line_2', 'city', 'state', 'postal_code'];

	//Get request to get all the users in the database
	$.get('/csvData', function(data, success){
//		console.log(data);		

		if(data.length > 0) {

			output += '<table border>\r\n';
			output += '<tr>\r\n';

			//Adding header row
			for (var j = 0; j < headers.length; j++) {
				output += '<td>'+ headers[j] + '</td>';
			};

			output += '</tr>\r\n';

			//Adding response data to the table
			for (var i = 0; i < data.length; i++) {
				output += '<tr>\r\n';
				for(value in data[i]) {

					output += '<td>'+ data[i][value] + '</td>\r\n';		
				}
				output += '</tr>\r\n';			
			};
			output += '</table>';

		} else {
			output += 'No records exists in database.';
		}
			
//		console.log(output);

		$('#csvResult').after(output);
	});
}

/*
	uploadCSVFile(event) :
		This function opens the csv file and saves the content in the database.
*/

function uploadCSVFile(event) {

	var files = event.target.files;
	var file = files[0];

	var output = '', row, item;
	output = '<table border>';

	var reader  = new FileReader();
	reader.readAsText(file);

	reader.onload = function(event) {
		var csv = event.target.result;

		var data = $.csv.toArrays(csv);
		var td;
//		console.log(data);
		
		for(row in data) {
			output += '<tr>\n';
			for(item in data[row]) {
				td = data[row][item].charAt(0).toUpperCase() + data[row][item].slice(1);
				output += '<td>' + td + '</td>';				
			}
			output += '</tr>';
		}
		output += '</table><br>';		

		var jsonCsvData = {array: parseCSVToObject(csv)};
//		console.log(jsonCsvData);
		
		//Post request to server to save csv data to database
		$.post('/csvData', jsonCsvData, function(data, success) {

			output += '<p>Saved data from uploaded csv file</p>';
			$('#csvResult').html(output);

		});
		
	}	
	
}

/* 

parseCSVToObject() :-  
	 	This function accepts csv content as parameter and parse it into a json object
	 	and return json.
*/

function parseCSVToObject (csvContent) {


	var fileLines = csvContent.split('\n');

	if(fileLines[fileLines.length-1] == '') {
		fileLines.splice(fileLines.length-1, 1);
	}

	var csvFirstLine = fileLines[0].split(',');

	var csvHeaders = ['first_name', 'last_name', 'add_line_1', 'add_line_2', 'city', 'state', 'postal_code'];
	var i, j, lineCount;
	var result = [];

	//checking if header is present in input csvContent
	for (var header = 0; header < csvHeaders.length; header++) {
		if(csvFirstLine[header] == csvHeaders[header]) {
			
			lineCount = 1;
			continue;

		} else {
			
			lineCount = 0;			
			break;
		}
	}

	//creating array objects for all the csv lines
	for (i = lineCount; i < fileLines.length; i++) {
		var object = {}, currentLine;

		currentLine = fileLines[i].split(',');
		
		for (j = 0; j < csvHeaders.length; j++) {
			object[csvHeaders[j]] = currentLine[j].charAt(0).toUpperCase() + currentLine[j].slice(1);
		};

		result.push(object);
	};

	return JSON.stringify(result);
	
}
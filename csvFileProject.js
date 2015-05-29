

$(document).ready(function() {
	$('#inputFile').bind('change', uploadCSVFile);
	$('#showUsersBtn').bind('click', showAllUsers);
});

function showAllUsers() {
	
	var output = '';
	var headers = ['first_name', 'last_name', 'add_line_1', 'add_line_2', 'city', 'state', 'postal_code'];

	$.get('/csvData', function(data, success){
		console.log(data);		

		if(data.length > 0) {

			output += '<table border>\r\n';
			output += '<tr>\r\n';

			for (var j = 0; j < headers.length; j++) {
				output += '<td>'+ headers[j] + '</td>';
			};

			output += '</tr>\r\n';

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
			
		console.log(output);

		$('#csvResult').after(output);
	});
}

function uploadCSVFile(event) {

	var files = event.target.files;
	var file = files[0];

	var output = '', row, item;
	output = '<table border>';

	var reader  = new FileReader();
	reader.readAsText(file);

	reader.onload = function(event) {
		var csv = event.target.result;
		console.log(csv);
		var data = $.csv.toArrays(csv);
		var td;
		console.log(data);
		
		for(row in data) {
			output += '<tr>\n';
			for(item in data[row]) {
				td = data[row][item].charAt(0).toUpperCase() + data[row][item].slice(1);
//				td = data[row][item];
				output += '<td>' + td + '</td>';				
			}
			output += '</tr>';
		}
		output += '</table><br>';

		console.log(output);
		

		var jsonCsvData = {array: parseCSVToObject(csv)};
		console.log(jsonCsvData);

		$.post('/csvData', jsonCsvData, function(data, success) {
			console.log("Data: "+data+ "success: "+ success);
			output += '<p>Saved data from uploaded csv file</p>';
			$('#csvResult').html(output);
		});
		
	}	
	
}

/* 

parseCSVToObject() :- 

	Description : 
	 	This function accepts csv file as parameter and parse it into a json object
	 	for further manipulation.
*/



function parseCSVToObject (csvFile) {


	var fileLines = csvFile.split('\n');
	console.log(fileLines[fileLines.length-1] == '');

	if(fileLines[fileLines.length-1] == '') {
		fileLines.splice(fileLines.length-1, 1);
	}
	console.log(fileLines.length);

	var csvFirstLine = fileLines[0].split(',');
	console.log(csvFirstLine);

	var csvHeaders = ['first_name', 'last_name', 'add_line_1', 'add_line_2', 'city', 'state', 'postal_code'];
	var i, j, lineCount;
	var result = [];

	for (var header = 0; header < csvHeaders.length; header++) {
		if(csvFirstLine[header] == csvHeaders[header]) {
			lineCount = 1;
			console.log(lineCount);
			continue;
		} else {
			lineCount = 0;
			console.log(lineCount);
			break;
		}
	}

	for (i = lineCount; i < fileLines.length; i++) {
		var object = {}, currentLine;

		currentLine = fileLines[i].split(',');
		
		for (j = 0; j < csvHeaders.length; j++) {
			object[csvHeaders[j]] = currentLine[j].charAt(0).toUpperCase() + currentLine[j].slice(1);
//			object[csvHeaders[j]] = currentLine[j];
		};

		result.push(object);
	};

	return JSON.stringify(result);
	
}
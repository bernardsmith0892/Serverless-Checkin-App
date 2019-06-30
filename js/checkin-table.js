/*
	Verify that the user is logged in. Checks for any parameters and checks that the expiration date in the id_token has not passed.
	
	Otherwise, it informs the user to login.
*/
if(window.location.href.split('#')[1] != undefined){
	var params = window.location.href.split('#')[1].split('&');
	var id_data = JSON.parse(atob(params[0].split('=')[1].split('.')[1]));
	var access_token = JSON.parse(atob(params[1].split('=')[1].split('.')[1]));
	
	if(id_data['exp'] === undefined || id_data['exp'] * 1000 <= new Date()){
		document.getElementById('checkinTable').innerHTML = '<b>Please login or create an account!</b>';
	}
	else{
		document.getElementById('checkinButton').hidden = false;
		document.getElementById('checkinTable').innerHTML = '<b>Fetching the table now!</b>'
		
		document.getElementById('login').outerHTML = '<a class="button" id="login" href="https://nsec-checkin.auth.us-east-1.amazoncognito.com/logout?client_id=jl5grlk9nu8ltc2r94bbslj06&logout_uri=https://dmvy87rq5xw4m.cloudfront.net/index.html">Logout</a>'
		
		updateTable();
		var interval = setInterval(updateTable, 10000);
	}
}
else{
	document.getElementById('checkinTable').innerHTML = '<b>Please login or create an account!</b>';
}


/*
	Converts the JSON check-in data to an HTML table.
*/
function json2table(json, classes){
	var headerRow = '';
	var bodyRows = '';
	
	// Create an empty table if there are no check-in entries.
	if(json.length === 0){
		headerRow += '<th>Name</th>';
		headerRow += '<th>Last Check-in</th>';
		bodyRows += '<tr>';		
		bodyRows += '<td></td>';
		bodyRows += '<td></td>';		
		bodyRows += '</tr>';
		
		return '<table class="' +
			classes +
			'">' +
			headerRow +
			'<tbody>' +
			bodyRows +
			'</tbody></table>';
	}
	
	var cols = Object.keys(json[0]);
	
	// Sorts the entries by their timestamps in descending order.
	json.sort((a, b) => {
		return new Date(b['timestamp']).getTime() - new Date(a['timestamp']).getTime();
	});
		
	classes = classes || '';
	
	// Nested function to convert the UTC date into the local timezone and format.
	function convertDate(date) {
		if(date === "1-01-01 00:00:00.000000"){
			return "No check-ins found!";
		}
		
		options = {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric', 
			hour12: false
		}
					
		ret_date = new Date(date + "UTC");
		return Intl.DateTimeFormat('default', options).format(ret_date);
	}
	
	// Determines whether to mark an item as overdue. Is based on if the latest timestamp for that user is before the start of today.
	function isLate(date) {
		start = new Date();
		start.setHours(0, 0, 0, 0);
		
		return new Date(date + "UTC") < start;
	}

	headerRow += '<th>Name</th>';
	headerRow += '<th>Last Check-in</th>';
	
	json.map(function(row) {
		bodyRows += '<tr>';
		
		late = (isLate(row['timestamp']) ? "late" : "good")
		
		bodyRows += '<td class="' + late + '">' + row['name'] + '</td>';
		bodyRows += '<td class="' + late + '">' + convertDate(row['timestamp']) + '</td>';
		
		bodyRows += '</tr>';
	});

	return '<table class="' +
        classes +
        '">' +
        headerRow +
        '<tbody>' +
        bodyRows +
        '</tbody></table>';
}

/*
	GETs the latest check-in data from the API Gateway endpoint.
*/
function updateTable(){
	fetch('https://n3kjj387md.execute-api.us-east-1.amazonaws.com/default/checkin?group=test',
		{
		headers: {
            'Authorization': params[0].split('=')[1]
		}})
		.then(response => response.json())
		.then(data => {
			document.getElementById('checkinTable').innerHTML = json2table(data, 'table');
		})
		.catch(err => {
			console.log(err);
		})
}

/*
	POSTs the user's check-in to the API Gateway endpoint.
*/
function checkIn(){
	fetch('https://n3kjj387md.execute-api.us-east-1.amazonaws.com/default/checkin', 
		{
		method: 'POST',
		headers: {
            'Authorization': params[0].split('=')[1]
        },
		body: '{"name":"' + id_data['name'] + '"}'
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			updateTable();
		})
		.catch(err => {
				console.log(err);
		})
}




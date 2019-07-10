// Banner text shown prior to login
var banner_motd = '<b><p style="width:60%">You are accessing a (notional) U.S. Government information system. Information system usage may be monitored, recorded, and subject to audit. Unauthorized use of the information system is prohibited and subject to criminal and civil penalties. Use of the information system indicates consent to monitoring and recording. Authorized use of the system only includes accessing and updating data the user is authorized access to.<br><br>This <code>banner motd</code> is for educational purposes only and is not actually binding for any legal purpose.</p></b>';

/*
	Verify that the user is logged in. Checks for any parameters and checks that the expiration date in the id_token has not passed.
	
	Otherwise, it informs the user to login.
*/
if(window.location.href.split('#')[1] != undefined || document.cookie.length > 0){
	var id_token;
	
	try{
		id_token = (";" + document.cookie).split(";Authorization=")[1].split(";")[0];
		var id_data = JSON.parse(atob(id_token.split('.')[1]));
	}
	catch(err){
		var params = window.location.href.split('#')[1].split('&');
		id_token = params[0].split('=')[1];
		var id_data = JSON.parse(atob(id_token.split('.')[1]));
		var access_token = JSON.parse(atob(params[1].split('=')[1].split('.')[1]));
	}
		
	if(id_data['exp'] === undefined || id_data['exp'] * 1000 <= new Date()){
		document.getElementById('checkinTable').innerHTML = banner_motd;
	}
	else{
		if(document.cookie.length === 0){
			document.cookie = "Authorization=" + id_token + "; expires=" + new Date(id_data['exp'] * 1000).toUTCString();
		}
		
		document.getElementById('checkinButton').hidden = false;
		document.getElementById('checkinTable').innerHTML = '<b>Fetching the table now!</b>'
		
		document.getElementById('login').outerHTML = '<a class="button" id="login" href="https://auth.nsec-checkin.brndjsmith.net/logout?client_id=jl5grlk9nu8ltc2r94bbslj06&logout_uri=https://nsec-checkin.brndjsmith.net/index.html">Logout</a>'
		
		updateTable();
		var interval = setInterval(updateTable, 10000);
	}
}
else{
	document.getElementById('checkinTable').innerHTML = banner_motd;
}

// Formats a UTC-ONLY DATE STRING into "YYYY-MM-DDTHH:MM:SSZ" so that it 'hopefully' works on Safari
// Takes everything before the '.', adds the 'Z' timezone and replaces the space between date and time with the 'T' identifier.
// Returns it as a Date object.
function safariFriendlyDate(date) {
	return new Date((date.split('.')[0] + 'Z').replace(' ', 'T'));
}

// Convert the UTC date into the local timezone and format.
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
	
	return Intl.DateTimeFormat('default', options).format(safariFriendlyDate(date));
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
		return safariFriendlyDate(b['timestamp']).getTime() - safariFriendlyDate(a['timestamp']).getTime();
	});
		
	classes = classes || '';
	
	// Determines whether to mark an item as overdue. Is based on if the latest timestamp for that user is before the start of today.
	function isLate(date) {
		start = new Date();
		start.setHours(0, 0, 0, 0);
		
		return safariFriendlyDate(date) < start;
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
	fetch('https://api.nsec-checkin.brndjsmith.net/default/checkin?group=test',
		{
		headers: {
            'Authorization': id_token
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
	fetch('https://api.nsec-checkin.brndjsmith.net/default/checkin', 
		{
		method: 'POST',
		headers: {
            'Authorization': id_token
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

function logout(){

}

document.getElementById('login').addEventListener('click', function (event) {
  // Do something before following the link 
  if (document.getElementById('login').innerHTML === 'Logout'){
	document.cookie = "Authorization= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
  }
  // Get url from the target element (<a>) href attribute
  var url = event.target.href;

  // Open the url in the current window. Set to "_blank" instead of "_self" to open in a new window.
  window.open(url, '_self');

  // Prevent default action (e.g. following the link)
  event.preventDefault();
});




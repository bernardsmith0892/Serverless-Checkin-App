import json
import time
from datetime import *

checkins = []
checkins.append( {"name" : 'John Thompson', "timestamp" : datetime.strftime(datetime.utcnow(), '%Y-%m-%d %H:%M:%S.%f')} )
checkins.append( {"name" : 'Tom Johnson', "timestamp" : datetime.strftime(datetime.utcnow() - timedelta(minutes=59), '%Y-%m-%d %H:%M:%S.%f')} )
checkins.append( {"name" : 'Jane Doe', "timestamp" : datetime.strftime(datetime.utcnow() + timedelta(minutes=32), '%Y-%m-%d %H:%M:%S.%f')} )
checkins.append( {"name" : 'Dane Joe', "timestamp" : datetime.strftime(datetime.utcnow() - timedelta(days=1), '%Y-%m-%d %H:%M:%S.%f')} )

json.dumps(checkins)

"""
// Copy and paste this into the DevTools console
// Switch the login button to a logout button
document.getElementById('login').outerHTML = '<a class="button" id="login" href="https://auth.nsec-checkin.brndjsmith.net/logout?client_id=jl5grlk9nu8ltc2r94bbslj06&logout_uri=https://nsec-checkin.brndjsmith.net/index.html">Logout</a>'

// Reveal the check-in UI
document.getElementById('checkinButton').hidden = false;
document.getElementById('checkinTable').innerHTML = '<b>Fetching the table now!</b>'

// Reveal a mock table
var data = [{"name": "John Thompson", "timestamp": "2020-12-13 05:50:57.323637"}, {"name": "Tom Johnson", "timestamp": "2020-12-13 04:51:57.327149"}, {"name": "Jane Doe", "timestamp": "2020-12-13 06:22:57.334511"}, {"name": "Dane Joe", "timestamp": "2020-12-12 05:50:57.340754"}];

document.getElementById('checkinTable').innerHTML = json2table(data, 'table');
"""
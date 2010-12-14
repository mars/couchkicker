var sys = require("sys");
var http = require("http");

var couchdb = http.createClient(5984, '127.0.0.1');
var refreshPeriodMs = 60000;
var refreshQuerystring = '?limit=0'; // get only metadata when triggering
var dbUpdateCounts = {};

var stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (chunk) {
	// listen for input from CouchDB; looks like {"type":"updated","db":"kickable"}
	var notification = JSON.parse(chunk);
	if (notification.type == "updated") {
		dbUpdateCounts[notification.db] == undefined ? 
			dbUpdateCounts[notification.db]=1 : dbUpdateCounts[notification.db]++;
	}
});

var refreshViews = function() {
	// making a GET request for every view in each database that has had updates since last
	for (var db in dbUpdateCounts) {
		var v = dbUpdateCounts[db];
		if (v != undefined && v > 0) {
			sys.debug('couchkicker sending update for '+db+' after '+v+(v==1 ? ' update' : ' updates'));
			dbUpdateCounts[db] = 0;
			forEveryView(db, function(path) {
				sys.debug('couchkicker forEveryView '+db+' '+path);
				var request = couchdb.request('GET', path+refreshQuerystring);
				request.end();
			})
		}
	};
	setTimeout(refreshViews, refreshPeriodMs);
}
var forEveryView = function(db, callback) {
	// list the design docs in the database
	var request = couchdb.request('GET', '/'+db+'/_all_docs?startkey=%22_design%2F%22&endkey=%22_design0%22&include_docs=true');
	request.end();
	request.on('response', function (response) {
		var paths = [];
    if(response.statusCode !== 200) return;
	  response.setEncoding('utf8');
    var responseBody = '';
    response.addListener('data', function(chunk) {
      responseBody += chunk;
    });
		// once the chunks are all here, extract the list of view paths to refresh
    response.addListener('end', function() {
			var docs = JSON.parse(responseBody).rows;
			for (var doc in docs) {
				doc = docs[doc].doc;
				for (var view in doc.views) {
					paths.push('/'+db+'/'+doc._id+'/_view/'+view);
				}
			}
			// then run the callback for each view path
			var path = paths.pop();
			while (path) {
				callback(path);
				path = paths.pop()
			}
    });
	});
}

// start the cycle
refreshViews();

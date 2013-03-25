var http = require('http');
var Backbone = require('backbone');
var _ = require('lodash');

// Statics _________________________

// Const ---------------------------
var STATUS = {
	OK: 200,
	NOT_FOUND: 400,
	INTERNAL_SERVER_ERROR: 500
};

var LISTEN_PORT = 8000;

//__________________________________

var Server = Backbone.Model.extend({
	serverPage: null,
	server: null,
	go: 'test',

	initialize: function() {
		_.bindAll(this);
	},

	create: function() {
		this.server = http.createServer(this.onCreate).listen(LISTEN_PORT);
		go = 'what';
		console.log('Server running at http://localhost:' + LISTEN_PORT);
	},

	onCreate: function(request, response) {
		this.serverPage = response;
		console.log('created:', this.serverPage);
		//writeResponse('go');
	},

	check: function() {
		console.log('go', go);
	},

	writeResponse: function(message, code, header) {
		var serverPage = this.serverPage;
		if (!serverPage.headersSent) {
			if (isNaN(code)) 
				code = STATUS.OK;
			if (header == null)
				header = {'Content-Type': 'text/plain'};

			serverPage.writeHead(code, header);
		}
		serverPage.end(message);
	},

	close: function() {
		this.server.close();
	}
});

module.exports = Server;
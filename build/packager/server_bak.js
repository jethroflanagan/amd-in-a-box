var http = require('http');

function Server()
{
	// Constants
	var STATUS = {
		OK: 200,
		NOT_FOUND: 400,
		INTERNAL_SERVER_ERROR: 500
	};

	var LISTEN_PORT = 8000;

	var serverPage;
	var go = 'test';
	
	function create() {
		http.createServer(onCreate).listen(LISTEN_PORT);

		console.log('Server running at http://localhost:' + LISTEN_PORT);
	}

	function onCreate(request, response) {
		serverPage = response;
		//writeResponse('go');
	}

	function check() {
		console.log('go', go);
	}

	function writeResponse(message, code, header) {

		if (!serverPage.headersSent) {
			if (isNaN(code)) 
				code = STATUS.OK;
			if (header == null)
				header = {'Content-Type': 'text/plain'};

			serverPage.writeHead(code, header);
		}
		serverPage.end(message);
	}

	return {
		create: create,
		writeResponse: writeResponse
	};
}

module.exports = new Server();
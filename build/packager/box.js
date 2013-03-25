var Packager = require('./packager');
var Compiler = require('./compiler');

/**
	Use the flags to adjust. 
	If no flags are called, the packager and compiler will both run. Otherwise, only the
	specified systems will be called

	flags:
	-p, --package	Enable Packager.
	-l, --listen	Enable Packager and listen for file changes (runs continuously).
					It will only update the packages if an update is necessary.
					If compile flag ('-c') is set, every package update will also compile the source.
	-c, --compile	Copy to deploy folder and compile.
	-v, --version 	@TODO
	-config			Specify config file, enclose in double quotes, e.g. "../config.json".
	
	Example usage:
	$ node run -p 
*/
var runCompiler = false;
var setupPackages = false;
var listen = false;
var configPath = null;

var addedPackager = false;
var addedCompiler = false;

process.argv.forEach(function(val, index, array) {
	switch(val) {
		case '-p':
		case '--package':
			setupPackages = true;
			addedPackager = true;
			break;

		case '-l':
		case '--listen':
			setupPackages = true;
			addedPackager = true;
			listen = true;
			break;

		case '-c':
		case '--compile':
			runCompiler = true;
			addedCompiler = true;
			break;
	}
});

// if none are flagged, enable both
if (!addedCompiler && !addedPackager) {
	runCompiler = true;
	setupPackages = true;
};

if (setupPackages)
	var packager = new Packager(listen);

if (runCompiler) {
	var compiler = new Compiler();
	if (listen)
		packager.setOnUpdateCallback(compiler.compile);
}


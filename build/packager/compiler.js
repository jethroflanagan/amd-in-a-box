var fileSystem = require('fs');

var Backbone = require('backbone');
var _ = require('lodash');

var Config = require('./config');
var ConfigType = require('./config_type');
var PackageResolver = require('./package_resolver');

/**
	May work independantly of the packager if needed.
	This is not a minifier. Minification should be run after code is compiled.
	TODO join files loaded by bootstrap.js into one file, and remove references to box.scriptLoaded
*/
var Compiler = Backbone.Model.extend({
	packagerConfig: null,
	compilerConfig: null,
	packageResolver: null,
	scriptPath: null,

	initialize: function() {
		_.bindAll(this);
		this.compile();
	},

	compile: function() {
		this.packagerConfig = new Config(ConfigType.packager);	
		this.compilerConfig = new Config(ConfigType.compiler);	
		this.packageResolver = new PackageResolver(this.packagerConfig);
		this.scriptPath = this.compilerConfig.file.source_path + '/' + this.compilerConfig.file.script_path;

		this.copyToDeployPath();
		console.log('Compiled', this.packagerConfig.getTime());
	},

	copyToDeployPath: function() {
		var deployPath = this.packagerConfig.file.deploy_path;
		var sourcePath = this.packagerConfig.file.source_path;

		// first remove all files
		this.removeDir(deployPath);

		this.copyDir(sourcePath, deployPath);		
	},

	copyFile: function(fromPath, toPath) {
		var input = fileSystem.readFileSync(fromPath, 'utf8');
		if (fromPath.substr(0, this.scriptPath.length + 1) == this.scriptPath + '/') {
			input = this.packageResolver.rewritePackageNames(input);
		}
		var output = fileSystem.writeFileSync(toPath, input, 'utf8');
	},

	copyDir: function(fromPath, toPath) {
		var files = fileSystem.readdirSync(fromPath);

		for (var i in files) {
			var currentFile = fromPath + '/' + files[i];
			var stats = fileSystem.statSync(currentFile);
			
			var match = this.matchPath(currentFile, toPath);
			if (stats.isDirectory()) {
				//skip dot prefix dirs
				if (files[i].charAt(0) == '.')
					continue;
				this.createDir(match);
				this.copyDir(currentFile, toPath);
			}
			else {
				this.copyFile(currentFile, match);
			}
		}
	},

	/**
	 copy the contents of fromPath to toPath (sourcePath is first subtracted from fromPath)
	 deploy_path should be prefixed in the toPath
	 e.g.
	 	from: 						'test/from/js/path/stuff'
	 								 ^ ignore   ^ use
	 	config.file.source_path: 	'test/from/js'
	 	to: 						'to/script'
	 	matchedPath: 				'to/script/path/stuff'
	*/
	matchPath: function(fromPath, toPath) {
		fromPath = fromPath.substr(this.packagerConfig.file.source_path.length);
		return toPath + fromPath;
	},

	removeDir: function(path) {
		if (!fileSystem.existsSync(path))
			return;
		var files = fileSystem.readdirSync(path);

		for (var i in files) {
			var currentFile = path + '/' + files[i];
			var stats = fileSystem.statSync(currentFile);
			
			if (stats.isDirectory())
				this.removeDir(currentFile);
			else
				fileSystem.unlinkSync(currentFile);
		}

		fileSystem.rmdirSync(path);
	},

	// TODO optimise with a better algorithm
	createDir: function(path) {
		if (fileSystem.existsSync(path))
			return;

		var pathNames = path.split('/');

		// make each subsequent folder
		path = '';
		for (var i = 0; i < pathNames.length; i++) {
			path += pathNames[i] + '/';
			if (pathNames[i] == '..')
				continue;
			if (fileSystem.existsSync(path))
				continue;
			fileSystem.mkdirSync(path);
		}
	}
	
});

module.exports = Compiler;
var Backbone = require('backbone');
var _ = require('lodash');
var fileSystem = require('fs');
//var walk = require('walk');

var Directory = Backbone.Model.extend({
	dropFolders: null,

	initialize: function(config) {
		_.bindAll(this);
		if (!config)
			throw new Error('Config not defined');
		this.config = config;
	},

	setupClasses: function() {
		this.dropFolders = this.getDropFolders();
		return this.list(this.config.source_path);
	},

	list: function(path) {
		var config = this.config;
		var classMap = {};
		var files = fileSystem.readdirSync(path);

		for (var i in files) {
			var currentFile = path + '/' + files[i];
			var stats = fileSystem.statSync(currentFile);
			
			if (stats.isDirectory()) {
				var folderName = files[i];

				// check if the folder can be skipped
				if (config.ignore_folders.indexOf(folderName) > -1)
					continue;

				//has . as prefix e.g. .svn
				if (config.ignore_dot_folders && folderName.charAt(0) == '.')
					continue;
				
				// mark project folder for reduction
				if (folderName == config.project)
					folderName = '.' + folderName;

				if (this.isDropFolder(currentFile)) //use full path for test
					folderName = '!' + folderName;

				var subClassMap = this.list(currentFile);

				// if ignore_empty=true only include if has .js files, otherwise just include it
				if (Object.keys(subClassMap).length === 0) {
					if (!config.ignore_empty_dirs)
						classMap[folderName] = [];						
					continue;
				}

				classMap[folderName] = subClassMap;
				continue;
			}

			//is a file, so try rename
			var className = this.renameAsClass(files[i]);
			if (className) //valid class
				classMap[className] = '';
		}

		return classMap;
	},

	renameAsClass: function(file) {
		file = file.toLocaleLowerCase();
		var extensionStart = file.indexOf('.');

		if (extensionStart > -1) {
			var extension = file.substr(extensionStart + 1);
			if (this.config.allowed_extensions.indexOf(extension) == -1)
				return false;

			var name = '';
			var fullNames = file.substr(0, extensionStart).split('_');
			for (var i = 0; i < fullNames.length; i++) {
				name += fullNames[i].charAt(0).toLocaleUpperCase() + fullNames[i].substr(1);
			}

			return name;
		}
		return false;
	},

	isDropFolder: function(path) {
		var dropFolders = this.config.drop_folders;
		return dropFolders && (dropFolders.indexOf(path) > -1);
	},

	getDropFolders: function() {
		var drop = this.config.drop_folders;
		var prefix = this.config.source_path;

		// add / to end of folder if needed
		if (prefix.charAt(prefix.length - 1) != '/')
			prefix += '/';

		for (var i = 0; i < drop.length; i++) {
			drop[i] = prefix + drop[i];
			//console.log('df:', drop[i]);
		}
		return drop;
	}

});

module.exports = Directory;
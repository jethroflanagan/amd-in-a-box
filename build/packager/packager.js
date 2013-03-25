// vendor
var Backbone = require('backbone');
var fileSystem = require('fs');
var _ = require('lodash');

//local
var Server = require('./server');
var Directory = require('./directory');
var Config = require('./config');

var Packager = Backbone.Model.extend({
	server: new Server(),
	config: null,
	listen: false,
	onUpdate: null,

	initialize: function(listen) {
		_.bindAll(this);
		if (!listen)
			console.log('Packaging...');
		else
			console.log('Package and listen for changes...');

		this.listen = listen;
		//if (listen)
		//	this.server.create();
		this.loadConfig();
	},

	loadConfig: function() {
		var config = new Config();
		this.config = config;

		this.setupMapping();
		var directory = new Directory(config.file);
		var files = directory.setupClasses();

		var whitespace = (config.file.pretty_print 
			? '\t'
			: -1);
		var settings = {packages: files};
		if (config.file.lib_folder) {
			settings.lib_folder = (directory.isDropFolder(config.file.source_path + '/' + config.file.lib_folder)
				? '!'
				: '') + config.file.lib_folder;
		}

		var output = JSON.stringify(settings, null, whitespace);
		output = config.file.output_start + output + config.file.output_end;
		var isUpdated = config.write(output);
		if (isUpdated && this.onUpdate) {
			console.log('Packages updated: ' + this.config.getTime());
			this.onUpdate();
		}
		//this.server.close();
		if (this.listen)
			setTimeout(this.loadConfig, config.watch_interval);
	},

	setOnUpdateCallback: function(callback) {
		this.onUpdate = callback;
	},

	// TODO
	setupMapping: function() {
		var mapList = this.config.file.map;
		for (var i = 0; i < mapList.length; i++) {
			mapList[i].from = mapList[i].from.split('/');
		}
	},

	// TODO
	getMapping: function() {
	}
});

module.exports = Packager;
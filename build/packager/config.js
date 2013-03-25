// TODO add checks when loading the config paths for stripping or adding '/' to the end
var Backbone = require('backbone');
var fileSystem = require('fs');
var _ = require('lodash');

var ConfigType = require('./config_type');

var Config = Backbone.Model.extend({
	configPath: null,
	file: null,

	initialize: function(configType) {
		_.bindAll(this);
		if (!configType)
			configType = ConfigType.packager;
		this.configPath = configType;
		this.load();
	},

	load: function() {
		var file = JSON.parse(fileSystem.readFileSync(this.configPath, 'utf8'));
		this.file = file;
	},

	write: function(content) {
		var file = this.file;
		var previousContent = fileSystem.readFileSync(file.output);
		if (previousContent != content) {
			fileSystem.writeFileSync(file.output, content, 'utf8');
			return true;
		}
		return false;
	},

	padValue: function(val, padding) {
		if (isNaN(padding))
			padding = 2;
		var pad = '';
		var valStr = val + '';
		for (var i = 0; i < padding - valStr.length; i++)
			pad += '0';
		return pad + valStr;
	},

	getTime: function() {
		var now = new Date();
		var pad = this.padValue;
		return '(' + 
			pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + ") " + 
			pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
	}

});

module.exports = Config;
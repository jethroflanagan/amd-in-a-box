var fileSystem = require('fs');

var Backbone = require('backbone');
var _ = require('lodash');

var Config = require('./config');

/**
 Some functions should be similar to PackageManager, just converted over to backbone. The relevant functions
 for each class should be kept in sync.
*/
var PackageResolver = Backbone.Model.extend({
	config: null,
	packages: null,

	initialize: function(config) {
		_.bindAll(this);
		this.config = config;
		var packageInfo = JSON.parse(this.getPackageInfo());
		this.packages = packageInfo.packages;
		this.createAllPackageNames(this.packages);
		this.reduce(this.packages);
	},

	resolvePkg: function(pack) {
		return this.resolvePath(this.packages, pack);
	},

	//TODO fix the untidy hack for testing '!' prefix
	resolveLib: function(pack) {
		var libPackages = this.packages[this.config.file.lib_folder];
		if (!libPackages)
			libPackages = this.packages['!' + this.config.file.lib_folder]; 
		return this.resolvePath(libPackages, pack);
	},

	/**
	 fix for inbuilt typeof
	 Based on PackageManager.getTypeof
	*/
	getTypeof: function(obj)
	{
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	},

	/** 
	 Based on PackageManager.checkExists
	*/
	resolvePath: function(packageList, pack) {
		var path = packageList;
		var packs = pack.split('.');
		for (var i = 0, len = packs.length; i < len; i++) {
			var prop = packs[i];
			if (path == undefined || prop == undefined || path[prop] == undefined) {
				var isValid = false;

				// try as a dropped folder
				if (path[prop] == undefined) {
					if (path['!' + prop]) {
						prop = '!' + prop;
						isValid = true;
					}
				}
				if (!isValid)
					throw new Error('Package does not exist: ' + pack);
			}

			path = path[prop];
		}
		if (this.getTypeof(path) != 'string')
			throw new Error('Must qualify full package name: ' + pack);

		// remove dropped folders
		packs = path.split('/');
		//reuse path
		path = '';
		for (var i = 0; i < packs.length; i++) {
			if (packs[i].charAt(0) != '!') {
				path += packs[i] + '/';
			}
		}
		path = path.substr(0, path.length - 1);

		return path;
	},

	/**
	 Based on PackageManager.createAllPackageNames
 	 @param packageList @volatile
	*/
	createAllPackageNames: function(packageList, path, parent)
	{
		if (path == undefined)
			path = '';
		for (var prop in packageList)
		{
			var currPath = path;
			this.createPackageName(packageList, prop, currPath);
		}
	},

	/**
	 Based on PackageManager.createPackageName
	*/
	createPackageName: function(packageList, prop, path)
	{
		if (this.getTypeof(packageList[prop]) == 'string')
		{
			packageList[prop] = packageList[prop].trim();
			packageList[prop] = path + (packageList[prop].length > 0 ? packageList[prop] : this.asFileName(prop));
		}
		else
		{
			var extPath = prop;

			//remove leading . from path
			if (extPath.charAt(0) == '.')
			{
				extPath = extPath.substr(1);
			}
			this.createAllPackageNames(packageList[prop], path + extPath + '/');
		}
	},

	/**
	 Based on PackageManager.reduce
	 remove . leading packages and place all its children on its parent.
	 e.g. {go: 'go', .test: {blah: 'test/blah'}} becomes {go: 'go', blah: 'test/blah'}
	*/
	reduce: function(packages, parent)
	{
		for (var prop in packages)
		{
			//remove leading . and pull all children of prop onto current branch
			if (prop.charAt(0) == '.')
			{
				for (var propChild in packages[prop])
				{
					packages[propChild] = packages[prop][propChild];
				}
				delete packages[prop];
			}
		}
	},

	/**
	 Based on PackageManager.asFileName
	 convert blahBlah to blah_blah
	*/
	asFileName: function(str)
	{
		return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
	},

	/**
	 Change box.pkg('foo.BarTest') to the actual file path location (e.g. 'foo/bar_test.js')
	*/
	rewritePackageNames: function(content) {
		var openPkg = "box.pkg('";
		var openLib = "box.lib('";
		var close = "')";
		var index = 0;
		while (true) {
			index = content.indexOf(openPkg, index);
			if (index == -1)
				break;
			var closeIndex = content.indexOf(close, index + 1);
			var packagePath = this.resolvePkg(content.substring(index + openPkg.length, closeIndex));
			content = content.substr(0, index) + "'" + packagePath + "'" + content.substr(closeIndex + close.length);
		}
		index = 0;
		while (true) {
			index = content.indexOf(openLib, index);
			if (index == -1)
				break;
			var closeIndex = content.indexOf(close, index + 1);
			var packagePath = this.resolveLib(content.substring(index + openLib.length, closeIndex));
			content = content.substr(0, index) + "'" + packagePath + "'" + content.substr(closeIndex + close.length);
		}
		return content;
	},

	/**
		Load up the config.json from Packager. Strip out everything to redeem package list
	*/
	getPackageInfo: function() {
		var rawPackageList = fileSystem.readFileSync(this.config.file.output, 'utf8');
		var dropStart = this.config.file.output_start;
		var dropEnd = this.config.file.output_end;

		return rawPackageList.substring(dropStart.length, rawPackageList.length - dropEnd.length);
	}
});

module.exports = PackageResolver;
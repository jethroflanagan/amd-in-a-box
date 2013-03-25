/**
	Packages are defined in json.
	Add a leading . to a package name to force all its children up one level,
	but retain the full path. This can speed up typing out imports for files
	by shortcutting the path. It is not necessary.
*/
(function()
{
	(function init()
	{
		var args = sys.args[0];
		var pack = args.packages;

		createAllPackageNames(pack);
		reduce(pack);
		sys.pkg = checkExists(pack);
		if (args.lib_folder)
		{
			sys.lib = checkExists(pack[args.lib_folder]); 
		}
		sys.scriptLoaded();
	})();

	/**
		@param packageList @volatile
	*/
	function createAllPackageNames(packageList, path, parent)
	{
		if (path == undefined)
			path = '';
		for (var prop in packageList)
		{
			var currPath = path;
			createPackageName(packageList, prop, currPath);
		}
	}

	function createPackageName(packageList, prop, path)
	{
		if (getTypeof(packageList[prop]) == 'string')
		{
			packageList[prop] = packageList[prop].trim();
			packageList[prop] = path + (packageList[prop].length > 0 ? packageList[prop] : asFileName(prop));
		}
		else
		{
			var extPath = prop;

			//remove leading . from path
			if (extPath.charAt(0) == '.')
			{
				extPath = extPath.substr(1);
			}
			createAllPackageNames(packageList[prop], path + extPath + '/');
		}
	}

	/**
		remove . leading packages and place all its children on its parent.
		e.g. {go: 'go', .test: {blah: 'test/blah'}} becomes {go: 'go', blah: 'test/blah'}
	*/
	function reduce(packages, parent)
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
	}

	//convert blahBlah to blah_blah
	function asFileName(str)
	{
		return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
	}

	//fix for inbuilt typeof
	function getTypeof(obj)
	{
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	}

	function checkPackagesAreUnique(packageList, names)
	{
		for (var prop in packageList)
		{
			if (getTypeof(packageList[prop]) == 'string')
			{
				if (names[packageList[prop]] === undefined)
					names[packageList[prop]] = 1;
				else
					throw new Error('Package name is in use: ' + packageList[prop]);
			}
			else
			{
				checkPackagesAreUnique(packageList[prop], names);
			}
		}
	}

	function checkExists(packageName)
	{
		return function(pack)
		{
			var path = packageName;
			var packs = pack.split('.');
			for (var i = 0, len = packs.length; i < len; i++)
			{
				var prop = packs[i];
				if (path == undefined || prop == undefined || path[prop] == undefined)
				{
					var isValid = false;

					// try as a dropped folder
					if (path[prop] == undefined)
					{
						if (path['!' + prop])
						{
							prop = '!' + prop;
							isValid = true;
						}
					}
					if (!isValid)
						throw new Error('Package does not exist: ' + pack);
				}

				path = path[prop];
			}
			if (getTypeof(path) != 'string')
				throw new Error('Must qualify full package name: ' + pack);

			// remove dropped folders
			packs = path.split('/');
			path = '';
			for (var i = 0; i < packs.length; i++)
			{
				if (packs[i].charAt(0) != '!') 
				{
					path += packs[i] + '/';
				}
			}
			path = path.substr(0, path.length - 1);
			return path;
		}
	}
})();
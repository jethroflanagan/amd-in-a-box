(function()
{
	// Alias console to easily remove console.log etc from the source without
	// commenting it out. Can't directly alias console.log and other functions
	// due to browser security restrictions.
	if (sys.IS_DEBUG)
	{
		sys.debug = console;
	}
	else //nix console logs entirely
	{
		sys.debug = function()
			{
				function log(){}
				function error(){}
			}
	}
	sys.scriptLoaded();
})();
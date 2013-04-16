(function()
{
	// Alias console to easily remove console.log etc from the source without
	// commenting it out. Can't directly alias console.log and other functions
	// due to browser security restrictions.
	if (box.IS_DEBUG)
	{
		box.debug = console;
	}
	else //nix console logs entirely
	{
		box.debug = function()
			{
				function log(){}
				function error(){}
			}
	}
	box.scriptLoaded();
})();
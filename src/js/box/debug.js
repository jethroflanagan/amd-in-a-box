(function()
{
	// Alias console to easily remove console.log etc from the source without
	// commenting it out. Can't directly alias console.log and other functions
	// due to browser security restrictions.
	if (box.IS_DEBUG)
	{
		// Avoid `console` errors in browsers that lack a console.
		var method;
		var noop = function () {};
		var methods = [
			'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
			'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
			'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
			'timeStamp', 'trace', 'warn'
		];
		var length = methods.length;
		var console = (window.console = window.console || {});

		while (length--) {
			method = methods[length];

			// Only stub undefined methods.
			if (!console[method]) {
				console[method] = noop;
			}
		}
		
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

(function()
{
	// JS global fixes
	//------------------------------
	
	// Adds a splice-like functionality, but since it seems impossible to affect the original 
	// string itself, fsplice (fake splice) is used to indicate that as it affects the ways 
	// code is written.
	if (!String.fsplice)
	{
		String.prototype.fsplice = function(start, length, replacement) {
			this.substr(0, start) + (replacement ? replacement : '') + this.substr(start + length);
			return this;
		}
	}
	box.scriptLoaded();
})();
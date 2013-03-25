define(
[
	sys.lib('Backbone'),
	sys.lib('Lodash')
],
function(Backbone, _)
{
	function init()
	{
		console.log('test is running', Backbone);
	}

	return {init: init};
});
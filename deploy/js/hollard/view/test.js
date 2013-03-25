define(
[
	'backbone',
	'lodash'
],
function(Backbone, _)
{
	function init()
	{
		console.log('test is running', Backbone);
	}

	return {init: init};
});
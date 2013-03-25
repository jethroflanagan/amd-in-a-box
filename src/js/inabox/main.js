define(
[
	sys.pkg('view.Test')
],
function(Test)
{
	function init()
	{
		console.log('main is running');
		console.log('sys.pkg', sys.pkg('vendor.Backbone'));
		Test.init();
	}

	return {init: init};
});
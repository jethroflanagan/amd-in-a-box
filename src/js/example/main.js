define(
[
	box.pkg('view.Test')
],
function(Test)
{
	function init()
	{
		console.log('main is running');
		console.log('box.pkg', box.pkg('vendor.Backbone'));
		Test.init();
	}

	return {init: init};
});
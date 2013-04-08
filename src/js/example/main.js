define(
[
	box.pkg('MyAppz')
],
function(Test)
{
	function init()
	{
		box.debug.log('main is running');
		box.debug.log('box.pkg(\'vendor.Backbone\') =', box.pkg('vendor.Backbone'));
		Test.init();
	}

	return {init: init};
});
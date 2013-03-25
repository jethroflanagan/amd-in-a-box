define(
[
	'inabox/view/test'
],
function(Test)
{
	function init()
	{
		console.log('main is running');
		console.log('sys.pkg', 'backbone');
		Test.init();
	}

	return {init: init};
});
require.config(
	{
		deps: ['example/app'],
		baseUrl: 'js/',

		//TODO Remove this for compile
        urlArgs: 'v=' + new Date().getTime(),

		paths:
			{
				jquery: 'vendor/jquery',
				backbone: 'vendor/backbone',
				lodash: 'vendor/lodash',
				partial: '../partial',
				text: 'vendor/plugin/require/text',
				handlebars: 'vendor/handlebars'
			},

		shim:
			{
				jquery:
					{
						exports: 'jQuery'
					},
				backbone:
					{
						exports: 'Backbone',
						deps: ['lodash']
					},
				lodash:
					{
						exports: '_'
					},
				handlebars: 
					{
						exports: 'Handlebars'
					}
			}
	}
);
# AMD in a Box
A bootstrapper that allows proper dependancy/package definitions in RequireJS with solid error logging.

This is to fix the string-style dependancy definition in RequireJS.

While this system is still being built, the packager and compiler both work correctly, so it can already be used. There are a number of features left to do, including making this documentation more useful.

It uses NodeJS for packaging and compilation.

## Vanilla RequireJS:
```js
define(
[
	'model/main'
],

function(Main) 
{
	Main.init();
});
```

## AMD in a Box:
```js
define(
[
	sys.pkg('model.Main') // resolves to model/main
],

function(Main) 
{
	Main.init();
});
```

The dependancies (or packages) take the dot notation style from Java, ActionScript 3 and similar languages.

If there is an error in the string in the `sys.pkg` call, a stack-trace will occur in the console immediately so you can see which file (and which line) has the issue. An error in plain RequireJS will sometimes indicate an error in a completely different file and a JS load error will only occur much later on.

There are example `src` and `deploy` folders to see how it works.

## Development environment
Dependancies are called in via sys.pkg (and sys.lib for 3rd party code if you want). These calls will check that the package actually exists. Naturally, for the push to live you don't need these checks and so all those calls will have their usual response baked into your code.
e.g. `sys.pkg('model.Main')` will be replaced for actual deployment with `model/main`.

The development environment makes use of a bootstrapper to load up everything before RequireJS and run the Package Manager.

The index file in src includes the following script tag
```html
<script id="sys"
	data-src="js/vendor/require.js" 
	data-attr="data-main=js/inabox/config.js"
	src="js/sys/bootstrap.js">
</script>
```

Once `js/sys/bootstrap.js` has run and fully initialised, it will create a script tag using the `data-src` and `data-attr` attributes. `data-attr` is ampersand (&) delimited. That script tag will generate:

```html
<script src="js/vendor/require.js" 
	data-main="js/inabox/config.js">
</script>
```

##Packaging and compilation
Location: `/build/packager`
Usage: `node box [flags]`

Use the flags to adjust what it does. 
If no flags are called, the packager and compiler will both run. Otherwise, only the specified will be called

### Config
Settings are in `packager_config.json`.

Example file:
```js
{
	"project": "inabox", // main project folder
	"source_path": "../../src/js",
	"deploy_path": "../../deploy/js", // this will be moving to compiler_config.json soon
	"reduce_project": true, // if a project folder is specified, this will allow you to reference files in there without having to prefix their package
	"output": "../../src/js/sys/package_list.js", //where to place the package output
	"output_start": "sys.depLoaded(", // needed for the bootstrapper (dev environment)
	"output_end": ");", // needed for the bootstrapper (dev environment)
	"pretty_print": true, // nice JSON
	"watch_interval": 1000, // the time to wait before checking for file changes
	"ignore_empty_dirs": true, // ignored for now
	"lib_folder": "vendor", // use this if you want to call 3rd party stuff via sys.lib
	"confirm_overwrite": true, // ignored for now
	"ignore_dot_folders": true, // don't recurse through .* folders (e.g. .git, .svn)
	"ignore_folders": ["sys"], // don't recurse through specific folders
	"allowed_extensions": ["js", "html"], // only copy over these file types
	"drop_folders": ["vendor"], // specifically for integrating with RequireJS's config file. Full explanation later.
	"map": // not currently implemented, but will allow files like lodash_v13 to be referenced as sys.lib('Lodash');
		[
			{
				"from": "vendor/backbone.min.v2",
				"to": "vendor/backbone"
			}
		]
}
```

### Flags:
`-p`, `--package`: Enable Packager.

`-l`, `--listen`: Enable Packager and listen for file changes (runs continuously). It will only update the packages if an update is necessary. If compile flag ('-c') is set, every package update will also compile the source.
`-c`, `--compile`: Copy to deploy folder and compile. This will only happen after any packaging takes place
`-config`: @TODO Specify config file, enclose in double quotes, e.g. "../config.json".
	
### Example usage:

Listen for file/folder changes, package then compile on change:
```bash
node box -l -c
```

Just package (will only run if there are file changes):
```bash
node box -p
```

Package, then compile:
```bash
node box -p -c
```

## Deployment

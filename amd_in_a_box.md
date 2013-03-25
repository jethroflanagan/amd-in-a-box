# AMD in a Box v0.1

## Why does this exist?
AMD is great for serious JS development but RequireJS has a big issue that makes it especially difficult to debug large scale JS apps.

File dependancies/includes are written in string form which makes it impossible to error check using front-end JavaScript.

We need to make debugging better and easier.

**Vanilla RequireJS:**

```javascript
define(['path/to/file_name'],
function(File) {
	...
});
```

If have a location for `path/to/file` that doesn't exist, the errors it shows often seem completely unrelated.

The "script load error" only shows up a fair amount of time after that. You still need to do a global project search to work out where the error exists.

## The solution
Run a check to ensure the file path is correct every time a dependancy is included. While we're at it, a nicer Java/AS3 style package notation wouldn't go amiss.

**So this is what we get:**

```javascript
define([sys.pkg('path.to.FileName']), // resolves to 'path/to/file_name'
function(File) {
	...
});
```

`sys.pkg` will make sure the file exists and throw an error immediately if it doesn't - an error with a full stack trace so you can easily see which file caused the issue.

Packages are converted to camel case from underscore style file/folder naming conventions (e.g. `foo_bar` to `fooBar`).

## Example

**Faulty code:**

```javascript
define(
[
	sys.pkg('view.Test')
],
function(Test)
{
	function init()
	{
	}
});
```

**Stack trace:**

```
Uncaught Error: Package does not exist: view.Test
	-> package_manager.js:131
(anonymous function)
	-> package_manager.js:131
(anonymous function)
	-> main.js:3
```

So now you can simply spellcheck line 3 of `main.js`.

# How does it work?
Of course, `sys.pkg` isn't running some magical hidden JS function. We're cheating a bit here. `sys.pkg` will check the string against a list of available packages.

## Making a reliable and up to date list of packages
**Wait, hold up! Don't run away just yet.** This isn't some cheap and dirty fix. 

The packages are automatically generated using a NodeJS packager recurses through all files in the script folder and turns them into a `JSON` list.

It's this list that the `sys.pkg` checks the package strings against.

The packager can also listen for changes in the script folder so that it automatically refreshes the package list.

## Won't all these checks slow down my code at run time?
Not by much. But it's better to have portable code that isn't tied to one system or another. So there's also a compiler which copies all of the code over to a deploy folder with the file paths baked in - so `sys.pkg('foo.FooBar')` becomes `foo/foo_bar` and there's no mention again of any `sys.pkg`

# Making it run
You need to get NodeJS installed. Then run `build/packager/box.js` like this: `node box [flags]` from the command line.

You can run the packager and compiler together or separately as well as telling them to watch for file changes.

## Flags
`-p`, `--package`: Run packager.

`-l`, `--listen`: Run packager and listen for file changes (runs continuously). It will only update the packages if an update is necessary. If the compile flag ('-c') is set, every package update will also compile the source.
`-c`, `--compile`: Copy code to the deploy folder and compile.
`-v`, `--version`: Still to come. Until it happens this is v 0.1
`-f`(ile), `--config`: Specify a config file, enclose in double quotes, e.g. -config "../config.json". This isn't yet implemented.

## Configuring the packager
Use the `build/packager/packager_config.json` file to control the packager. It outputs a file with a `json` encoded list of folders and files. 

**Example config:**

```json
{
	"project": "inabox",
	"source_path": "../../src/js",
	"reduce_project": true,
	"output": "../../src/js/sys/package_list.js",
	"output_start": "sys.depLoaded(",
	"output_end": ");",
	"pretty_print": true,
	"watch_interval": 1000,
	"ignore_empty_dirs": true,
	"lib_folder": "vendor",
	"confirm_overwrite": true,
	"ignore_dot_folders": true,
	"ignore_folders": ["sys"],
	"allowed_extensions": ["js", "html"],
	"drop_folders": ["vendor"],
	"map":
		[
			{
				"from": "vendor/backbone.min.v2",
				"to": "vendor/backbone"
			}
		]
}
```
**Example output:**

```javascript
sys.depLoaded({
	"packages": {
		".inabox": {
			"App": "",
			"Config": "",
			"Main": "",
			"view": {
				"Test": ""
			}
		},
		"!vendor": {
			"Backbone": "",
			"Handlebars": "",
			"Jquery": "",
			"Lodash": "",
			"plugin": {
				"require": {
					"Text": ""
				}
			},
			"Require": "",
			"Underscore": ""
		}
	},
	"lib_folder": "!vendor"
});
```

### Options
For now, all options need to be in the file, but just use the default settings. The ones marked optional can be left out in a later version of the packager.

**project:** *[optional]* String

This is the core project package. This does nothing on its own; other options refer to this.

---
**source_path:** *[required]* String

The location of the all the scripts. The scripts in here make use of `sys.pkg` and `sys.lib`. Use web/unix style paths (forward slashes).

---
**reduce_project:** *[optional]* Boolean

Add a dot to the front of the project folder in the package list. This marks the folder for reduction.

Reducing a folder means that when you refer to it in `sys.pkg` you don't need to include the reduced folder name. e.g. `sys.pkg('projectName.view.Foo')` can instead become `sys.pkg('view.Foo')`

*Roadmap:* change this to `"reduce_folders": []`

---
**output:** *[required]* String

The path to output the package list.

---
**output_start:** *[optional]* String

Prefix this to the content generated by the packager (i.e. the file list).

---
**output_end:** *[optional]* String

Append this after the content generated by the packager.

---
**output_end:** *[optional]* String

Append this after the content generated by the packager.

---
**pretty_print:** *[optional]* Boolean
The file output list is tabbed in.

*Roadmap:* Allow custom whitespacing for the indentation e.g. using spaces.

---
**watch_interval:** *[optional]* Integer

The delay between file system checks to see whether the config or the `source_path` files have changed (where 'changed' means that their names or locations have been altered).

Time is in milliseconds.

---
**ignore_empty_dirs:** *[optional]* Boolean

Currently forced to false. Defined whether to include empty folders in the package list.

---
**lib_folder:** **[optional]** String

Specifies which folder contains 3rd party source. Doesn't do anything on its own; other options reference it.

---
**confirm_overwrite:** *[required]* Boolean

Currently forced to `true`. Setting it as `false` means that the packager will prompt to overwrite the `output` file (Using `[y/n]` or similar in the command line).

---
**ignore_dot_folders:** *[optional]* Boolean

Todo...

---
**ignore_folders:** *[optional]* String Array

Todo...

---
**allowed_extensions:** *[optional]* String Array

Todo...

---
**drop_folders:** *[optional]* String Array

Todo...

---
**map:** *[optional]* Object Array

Todo...


## Configuring the compiler

Todo...

# Extra features

## Console logging with an off switch
It's an extra hassle to remove `console.log` and `console.error` references from your code before pushing it live. In some cases it can break your code if it's not done carefully. 

Now you can use `sys.debug.log` and `sys.debug.error` and turn it off by setting `sys.IS_DEBUG` to `false`.

## Global JS fixes
You can add all your fixes and prototype additions to JS, too. Here's a more consistent space to include things like fixing `indexOf` in IE or adding a `splice` function for strings.

With the compiler all of these additions will be compiled together into one file.

# Version 0.1? So what isn't working?
Only a few things. The compiler, packager and development environment all work so you can already use this in your workflow. Some of the config options for the compiler and packager aren't yet implemented. 

The compiler only copies over the `js` folder and not the rest of the source code just yet.

A few bugs exist (e.g. changing the output filename for the packager when the packager is running will cause a crash). 

The compiler assumes any code it compiles is perfect so it could wipe out files. Luckily, it first copies everything over to the deploy folder so it won't overwrite your existing source.

The compiler doesn't make sure that the source and deploy folders are different.

# Roadmap

* Moving all source code from `source_path` to `deploy_path`. 
* Adding in the missing config settings
* Creating a plugin system to add in:
	* a minifier
	* the require optimizer
	* other systems (e.g. grunt)
* Add in settings that allow configuring file and folder naming conversions
	
# More details: the internals of how it works

Todo...

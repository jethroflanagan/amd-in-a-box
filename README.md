# AMD in a Box v0.1
<<<<<<< HEAD
test
=======
blah
>>>>>>> Testing conflicts

## Note
This documentation is still a work in progress and needs a lot of clarity. Things marked as "Todo..." in this README may be working already, they just aren't documented yet.

## Why does this exist?
AMD is great for JS development. The various AMD solutions make it especially difficult to debug large scale JS apps. AMD in a Box aims to resolve this issue.

*Note:* AMD in a Box aims to be a wrapper for *any AMD implementation* but for now is targeted solely at RequireJS.

File dependencies/includes are written in string form which makes it impossible to error check using front-end JavaScript.

We need to make debugging more efficient and much easier.

**Vanilla RequireJS:**

~~~javascript
define(['path/to/file_name'],
function(File) {
	// ...
});
~~~

If have a location for `path/to/file` that doesn't exist, the errors it shows often seem completely unrelated.

The "script load error" only shows up a while after that. You still need to do a global project search to work out where the error exists.

## The solution
Run a check to ensure the file path is correct every time a dependency is included. Everything is namespaced into `window.box`.

**So this is what we get:**

~~~javascript
define([box.pkg('path.to.FileName']), // resolves to 'path/to/file_name' - see Package naming convention below
function(File) {
	// ...
});
~~~
`box.pkg` will make sure the file exists and throw an error immediately if it doesn't - an error with a full stack trace so you can easily see which file caused the issue.

# Quickstart 
todo

### Package naming convention
*Roadmap:* Disabling the "package name" naming (`path.to.FileName`) via the config and working with other file naming conventions (e.g. hyphens).

Packages are converted to camel case names from underscore style file naming conventions. So `here/is/my/class_name` becomes `here.is.my.ClassName`. This is taken from Java and ActionScript 3. Since this may not be a preferred naming style in the JS community, this will soon be disabled by default.

## Example

**Faulty code:**

~~~javascript
define([box.pkg('view.Test')],
function(Test) {
	function init()	{
	}
});
~~~

**Stack trace:**

~~~
Uncaught Error: Package does not exist: view.Test
	-> package_manager.js:131
(anonymous function)
	-> package_manager.js:131
(anonymous function)
	-> main.js:3
~~~

So now you can simply spellcheck line 3 of `main.js`.

# How does it work?
`box.pkg` checks the string against a list of available packages, based on the files in your project directory.

## Making a reliable and up to date list of packages

The packages are automatically generated using a NodeJS packager that recurses through all files in the script folder and turns them into a `JSON` list.

It's this list that the `box.pkg` checks the package strings against.

The packager can also listen for changes in the script folder so that it automatically refreshes the package list.

## Won't all these checks slow down my code at run time?
Not by much. But it's better to have portable code that isn't tied to one system or another. So there's also a compiler which copies all of the code over to a deploy folder with the file paths baked in - so `box.pkg('foo.FooBar')` becomes `foo/foo_bar` and there's no mention again of any `box.pkg`.

# Making it run
You need to get NodeJS installed. Then run `build/packager/box.js` like this: `node box [flags]` from the command line.

You can run the packager and compiler together or separately as well as telling them to watch for file changes.

## Flags
`-p`, `--package`: Run packager.

`-l`, `--listen`: Run packager and listen for file changes (runs continuously). It will only update the packages if an update is necessary. If the compile flag ('-c') is set, every package update will also compile the source.

`-c`, `--compile`: Copy code to the deploy folder and compile.

`-v`, `--version`: Until it happens this is v 0.1 `Not yet implemented.`

`-f`(File), `--config`: Specify a config file, enclose in double quotes, e.g. -config "../config.json". `Not yet implemented.`

## Configuring the packager
Use the `build/packager/packager_config.json` file to control the packager. It outputs a file with a `json` encoded list of folders and files. 

**Example config:**

~~~json
{
	"project": "inabox",
	"source_path": "../../box/js",
	"reduce_project": true,
	"output": "../../box/js/box/package_list.js",
	"output_start": "box.depLoaded(",
	"output_end": ");",
	"pretty_print": true,
	"watch_interval": 1000,
	"ignore_empty_dirs": true,
	"lib_folder": "vendor",
	"confirm_overwrite": true,
	"ignore_dot_folders": true,
	"ignore_folders": ["box"],
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
~~~
**Example output:**

~~~javascript
box.depLoaded({
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
~~~

Todo: Explain output

### Options
For now, all options need to be in the file, but just use the default settings. The ones marked optional can be left out in a later version of the packager.

**project:** *[optional]* String

This is the core project package. This does nothing on its own; other options refer to this.

---
**source_path:** *[required]* String

The location of the all the scripts. The scripts in here make use of `box.pkg` and `box.lib`. Use web/Unix style paths (forward slashes).

---
**reduce_project:** *[optional]* Boolean

Add a dot to the front of the project folder in the package list. This marks the folder for reduction.

Reducing a folder means that when you refer to it in `box.pkg` you don't need to include the reduced folder name. e.g. `box.pkg('projectName.view.Foo')` can instead become `box.pkg('view.Foo')`

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

*Roadmap:* Allow custom white spacing for the indentation e.g. using spaces.

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

Dot folders are any folders with a period as a prefix e.g. `.git`. Setting this to `true` will stop the packager from recursing through all folders like that, helping to optimise its route.

---
**ignore_folders:** *[optional]* String Array

The packager will not recurse through any folders in the list. Example usage: `ignore_folders: ["box"]`

---
**allowed_extensions:** *[optional]* String Array

*Roadmap:* To be changed to `allowed_file_extensions` for clarity
Only list files with the extensions in the array.

---
**drop_folders:** *[optional]* String Array

Adds a `!` before the folder name which means that all packages in the folder resolve to path names that don't include the dropped folder.
e.g. 
~~~json
{
	"!vendor": {
		"Backbone": ""
	}
}
~~~
**Usage:** `box.pkg('vendor.Backbone')` resolves the path as `'backbone``, removing `vendor`.
---
**map:** *[optional]* Object Array

`Not yet implemented.`
This will allow you to set filenames to resolve to something else entirely, e.g. from `backbone.min.js` to `backbone` which means you can swap out whether you use a minified library or not without changing any code in your source.

## Development Environment
The development environment library is in `js/box`. It uses the same namespace as the packager (`window.box`). Please don't deploy to a live server without first compiling.

The packager should be set to ignore the `box` folder to speed it up, although it won't break anything if it parses it.

## Configuring the compiler
`Not yet implemented.`
Todo...

# Extra features

## Console logging with an off switch
It's an extra hassle to remove `console.log` and `console.error` references from your code before pushing it live. In some cases it can break your code if it's not done carefully. 

Now you can use `box.debug.log` and `box.debug.error` and turn it off by setting `box.IS_DEBUG` to `false`.

## Event handling
There is an event manager that works very similarly to the RobotLegs framework's (ActionScript 3) event system, except that objects don't fire events, the manager does.

You can send and receive events (messages) between components without the components knowing about each other. Events can also be sent from anywhere - DOM elements are not needed as they are for JS's current event system. 

To listen to events, you can add a listener referencing a specific object (target) or you can listen to all events globally, which is [explained later](#global-events). You can add as many listeners to one event id as you like.

Events need an id or name to identify them uniquely so there isn't any accidental collision (events with matching ids). This can be any type of data - string, number, object, etc. 

The final thing to define in an event listener is the callback that will run once an event fires.

**Usage:**
Adding a listener:
~~~javascript
box.event.addListener(
	target, // the reference to the object
	'completedSort', // event id
	onCompletedSort // callback when event fires
	);
~~~
You can dispatch (fire or send) an event from anywhere else, including from the code that has the listener.

To dispatch an event, the target and the id must match the listener.

You can send data along with the event. This can be any type of data. Good practice would be to send an object or an instance through so you can ensure you're not getting event collisions on the receiving end by testing that the data is what you expect. You can leave this argument out if you don't need to pass anything further along.

~~~javascript
box.event.dispatch(
	this, // the reference to the object
	'completedSort', // event id
	data // any extra data you want to pass along as a message
	);
~~~

### Global events
If you want to keep objects or classes from having to know about each other at all, you can send events around with a `null` target. The object id must still match.

~~~javascript
box.event.addListener(
	null, // the reference to the object
	'completedSort', // event id
	onCompletedSort // callback when event fires
	);

// elsewhere	
box.event.dispatch(
	null, // the reference to the object
	'completedSort'
	);
~~~

### Creating better event ids
The best way to ensure each event is unique is to identify them with an object - even `{}` will do. 2 different strings with the same characters will match, but 2 different objects with the same properties will not.
~~~javascript
var str1 = "hello";
var str2 = "hello";
console.log(str1 === str2); // true

var obj1 = {};
var obj2 = {};
console.log(obj1 === obj2); // false
~~~
Strict equality (`===`) isn't necessary, it has the same results for normal equality checks (`==`).

## Global JS fixes
You can add all your fixes and prototype additions to JS, too. Here's a more consistent space to include things like fixing `indexOf` in IE or adding a `splice` function for strings.

With the compiler all of these additions will be compiled together into one file.

# Version 0.1? So what isn't working?
Only a few things. The compiler, packager and development environment all work so you can already use this in your workflow. Some of the config options for the compiler and packager aren't yet implemented. 

The compiler only copies over the `js` folder and not the rest of the source code just yet.

There are a few bugs e.g. if the output file doesn't already exist it crashes the packager. 

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
This is a non-essential section of the document. Feel free to skip it. It's for people who want to look more in depth as to how things work.
`Coming soon`

# AMD in a Box
A bootstrapper that allows proper dependancy/package definitions in RequireJS with solid error logging.

This is to fix the string-style dependancy definition in RequireJS.

While this system is still being built, the packager and compiler both work correctly, so it can already be used. There are a number of features left to do, including making this documentation more useful.

## Vanilla RequireJS:
```javascript
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
```javascript
define(
[
	sys.pkg('model.Main') // resolves to mode/main
],

function(Main) 
{
	Main.init();
});
```

If there is an error in the string in the `sys.pkg` call, a stack-trace will occur in the console immediately so you can see which file (and which line) has the issue. An error in plain RequireJS will sometimes indicate an error in a completely different file and a JS load error will only occur much later on.

There are example `src` and `deploy` folders to see how it works.

## Development environment
Dependancies are called in via sys.pkg (and sys.lib for 3rd party code if you want). These calls will check that the pacakge (or dependancy) actually exists. Naturally, for the push to live you don't need these checks and so all those calls will have their usual response baked into your code.
e.g. `sys.pkg('model.Main')` will be replaced for actual deployment with `model/main`.

##Packaging and compilation
Location: `/build/packager/box.js`
Usage: `node run [flags]`

Use the flags to adjust what it does. 
If no flags are called, the packager and compiler will both run. Otherwise, only the specified will be called

### Flags:
`-p`, `--package`: Enable Packager.

`-l`, `--listen`: Enable Packager and listen for file changes (runs continuously). It will only update the packages if an update is necessary. If compile flag ('-c') is set, every package update will also compile the source.
`-c`, `--compile`: Copy to deploy folder and compile.
`-config`: @TODO Specify config file, enclose in double quotes, e.g. "../config.json".
	
Example usage (listen for changes, package then compile on change):

```bash
node run -l -c
```
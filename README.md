# Node ESM HMR :rocket:
<img src="https://img.shields.io/badge/Licence-MIT-green"/> <img src="https://img.shields.io/github/issues-raw/davidnagli/node-esm-hmr"/>

A Super Lightweight, and easy-to-use, package for **H**ot **M**odule **R**eloading (HMR) native, vanilla, **E**CMA**S**cript **M**odules (ESM).

Yep... that's right, finally a solution for HMR in Node that works with the native ESM (`"type":"module"` in package.json or `*.mjs` files) :clap: 

## What are EcmaScript Modules (ESM)?

<details>
  <summary>EcmaScript Modules (ESM) are the new new way to import modules in JavaScript using the ES6 <code>import</code> syntax. They can be used by adding <code>"type":"module"</code> field in package.json <b><i>or</i></b> by changing the file extension from <code>.js</code> to <code>.mjs</code> 
  
(for more information, click here)</summary>
  The old syntax of using `require()` (called CommonJS imports) is riddled with issues and is pretty much the way-of-the-past these days. 

Ever since ES6 came out in June 2015, developers have been trying to use the new, clean, modern, and most importantly: standard, ESM syntax for module imports:
```javascript
// For default imports: 
import foo from './bar'
// For named imports:
import {foo} from './bar'
```
Instead of the old CommonJS imports:
```javascript
// For default imports: 
const foo = require('./bar');
// For named imports:
const {foo} = require('.bar');
```
However, for a very long time, Node.js didn't completely support ESM. So the only way to use it was if you used a bundler like [Webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/), or [Turbopack](https://turbo.build/pack) (which are great, but are complete overkill considering that in most cases you really don't need a bundler outside of the context of a browser) or using a transpiler like [Babel](https://babeljs.io/) (which would just transpile your ESM into CommonJS anyways).
support for .mjs files

But on on December 10, 2019 with the release of Node.js version 13.2.0, support for ESM was finally stabilized and no longer required the experimental flag. So now, by just adding the `"type":"module"` field in package.json _**or**_ by changing the file extension from `.js` to `.mjs`, anyone can easily use ESM. :grin:
</details>

## Why? 🤔
[WIP]
* reasoning for hmr on node
* explain why just using a file watcher + dynamic imports doesn't work
* it's really small and lightweight anyways, probably the same thing you would have written yourself

## How? 🤠
This is a super lightweight package that [wip]


## Usage Instructions

### Installation / Setup 
Install the package:
```
npm i --save-dev node-esm-hmr
```

Then, in whatever file you want to run the HMR from, import this package as `hmr`:
```javascript
import hmr from '../utils/node-esm-hmr.js';
```

### Usage
Now if you used to use the default export (your import statement used to be `import foo from './bar'`):
```javascript
hmr('./bar.js', '.', module =>{
  module.default(/*pass in whatever parameters you usually would here*/)
})
```

Or, if you were using named exports (your import statement used to be `import {foo} from './bar'`):
```javascript
hmr('./bar.js', '.', module =>{
  module.foo(/*pass in whatever parameters you usually would here*/)
})
```



## API
```javascript
hmr(modulePath: String, watchPath: string | string[], callback: fn (module: ModuleNamespaceObject) => void)

```

`hmr` is a function that takes 3 parameters:
1. `modulePath` - filepath of the module that you want to import (same as any other `import` or `import()`)
2. `watchPath` - The watch path(s) - can be a file, dir, glob, or array to watch
    * path(s) (string or array of strings): Paths to files, dirs to be watched recursively, or glob patterns.
        * We use [Chokidar](https://github.com/paulmillr/chokidar)'s `watch` feature internally, which has the following limitations:
          * Note: globs must not contain windows separators (\\), because that's how they work by the standard — you'll need to replace them with forward slashes (/).
          * Note 2: for additional glob documentation, check out low-level library: [picomatch](https://github.com/micromatch/picomatch).
3. `callback` - A function that get's called every time that there is a file change in the directory specified by watch path or the first time that the file runs 
    * This function get's called with a [Module Namespace Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object) as an argument.
        * This sounds confusing, but it's not. A Module Namespace Object is just an object with all of the exports of the module that you imported as methods of that object. The default export of the module is also there as a method called `.default()`. 
        * This is this way directly from NodeJS, not from this package; we just spit out what the ESM dynamic import gives us


## Disclaimer 
Do not use this in production!! This package is intended to help you while developing in your dev enviroment. In order to get dynamic imports work multiple times (which is the whole basis of how this package works) I had to use a dirty strategy for invalidating node's import cache. This hasn't broken anything from what I can tell, but it also might break at scale and might cause other issues in the long run (like a gradual memory leak and eventual crash if you keep the process running for way too long). 

Anyways, you should be perfectly fine running this while developing (worse case if it crashes or starts using too much memory just kill it `cntrl / cmd + C` and start it again, just don't don't use this for anything mission critical or produciton ready without testing this nuance first.

## Todo
- [ ] Create an optional ignore regex argument (really easy, just need to pass it to chokidar)

## Credits / Prior Art
This package is 100% inspired by [node-hmr](https://github.com/serhiinkh/node-hmr). I decided to create this package when I first tried using node-hmr and realized that it doesn't work at all for ESM. Initially, I considered sending a PR, but I realized that ESM makes it pretty much nesicarry to rewrite most of it, and they also make it a lot simpler.

This package on it's doesn't really do much on it's own (it's really lightweight), all the file-watching magic is provided by [Chokidar (https://github.com/paulmillr/chokidar) which is an amazing cross-platform file watcher. 

And, of course, thank you to [@Jasper De Moor](https://github.com/DeMoorJasper) who first explained to me what HMR was many years back while we were working on contributing to [https://parceljs.org/](Parcel) — the most amazing bundler on the planet. 

Created and maintained by [David Nagli](https://www.linkedin.com/in/davidnagli/)

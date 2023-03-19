# Node ESM HMR :fire: :rocket:

<img src="https://img.shields.io/badge/Licence-MIT-green"/> <img src="https://img.shields.io/github/issues-raw/davidnagli/node-esm-hmr"/> <img src="https://img.shields.io/github/last-commit/davidnagli/node-esm-hmr"/> <img src="https://img.shields.io/bundlephobia/min/node-esm-hmr"/> <img src="https://img.shields.io/node/v/node-esm-hmr">

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
import foo from './bar';
// For named imports:
import { foo } from './bar';
```

Instead of the old CommonJS imports:

```javascript
// For default imports:
const foo = require('./bar');
// For named imports:
const { foo } = require('.bar');
```

However, for a very long time, Node.js didn't completely support ESM. So the only way to use it was if you used a bundler like [Webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/), or [Turbopack](https://turbo.build/pack) (which are great, but are complete overkill considering that in most cases you really don't need a bundler outside of the context of a browser) or using a transpiler like [Babel](https://babeljs.io/) (which would just transpile your ESM into CommonJS anyways).
support for .mjs files

But on on December 10, 2019 with the release of Node.js version 13.2.0, support for ESM was finally stabilized and no longer required the experimental flag. So now, by just adding the `"type":"module"` field in package.json _**or**_ by changing the file extension from `.js` to `.mjs`, anyone can easily use ESM. :grin:

</details>

## Why? 🤔

You might be thinking: Why do I even need HMR in node in the first place? Why can't I just use [Nodemon](https://github.com/remy/nodemon) or [Node.js 19's new `--watch` flag](https://dev.to/sabbirsobhani/nodejs-v1900-watch-option-ck7) to just watch my files?

Well, the answer is simple: in most cases you don't need it. In fact, in some cases HMR can break some things if the module you are Hot Reloading has side effects such as caching.

HMR is really useful on the front-end for seeing the changes you make to a website in real-time, since websites usually have complex states that you want to maintain between changes to the code in order to make it easy to test. Front-ends also typicically need a bundler and transpiler so the build times are pretty long.

However, on the backend, we typically aren't used to using HMR. While developing we usually just refresh the entire app, since there is usually a low cost associated with doing so (pretty fast startup times).

But _**in the case you are working on something with a long startup (or even build) time or complex states**_, you might want to use HMR to simplify the development experience of that part of the project. **HMR allows you to only reload individual parts of your app, without touching the rest of your app.**

## How? 🤠

This is a super lightweight package that just uses ESM's dynamic imports `import()` syntax to load your module asyncrounously and on-demand (when the app is launched and when the code is changed). Since ESM imports cache the file, we also invalidate this cache on every reload by passing in an incremented GET parameter to the file path which suprisingly works.

This entire package is super tiny; it only has a few lines of code to resolve the module from the file path provided relative to the calling file, then dynamically `import()` it, and then pass it back to the callback so you can use it however you want. Since we pass back exactly what we get after calling `import()`, you should have ultimate flexibility to do whatever you want with your imports after they are hot-reloaded (when the callback is called).

We use [Chokidar](https://github.com/paulmillr/chokidar) for file watching since there's no need to re-invent the wheel there.

## Usage Instructions :page_with_curl:

### Installation / Setup :wrench:

Install the package:

```
npm i --save-dev node-esm-hmr
```

Then, in whatever file you want to run the HMR from, import this package as `hmr`:

```javascript
import hmr from 'node-esm-hmr';
```

### Usage :running:

Now if you used to use the default export (your import statement used to be `import foo from './bar'`):

```javascript
hmr('./bar.js', '.', (module) => {
  module.default(/*pass in whatever parameters you usually would here*/);
});
```

Or, if you were using named exports (your import statement used to be `import {foo} from './bar'`):

```javascript
hmr('./bar.js', '.', (module) => {
  module.foo(/*pass in whatever parameters you usually would here*/);
});
```

## API ⚙️

```javascript
export default function hmr(modulePath: string, watch : string | string[], callback: (module: ModuleNamespaceObject) => void,  clearEveryTime: boolean): void;

```

`hmr` is a function that takes 3 parameters:

1. `modulePath` - filepath of the module that you want to import (same as any other `import` or `import()`)
2. `watchPath` - The watch path(s) - can be a file, dir, glob, or array to watch
   - path(s) (string or array of strings): Paths to files, dirs to be watched recursively, or glob patterns.
     - We use [Chokidar](https://github.com/paulmillr/chokidar)'s `watch` feature internally, which has the following limitations:
       - Note: globs must not contain windows separators (\\), because that's how they work by the standard — you'll need to replace them with forward slashes (/).
       - Note 2: for additional glob documentation, check out low-level library: [picomatch](https://github.com/micromatch/picomatch).
3. `callback` - A function that get's called every time that there is a file change in the directory specified by watch path or the first time that the file runs
   - This function get's called with a [Module Namespace Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object) as an argument.
     - This sounds confusing, but it's not. A Module Namespace Object is just an object with all of the exports of the module that you imported as methods of that object. The default export of the module is also there as a method called `.default()`.
     - This is this way directly from NodeJS, not from this package; we just spit out what the ESM dynamic import gives us
4. `clearEveryTime` - A boolean that specifies whether or not to clear the console every time the file is changed. Defaults to `false`.

## Getting Started ⚡

### Hello World

Create a package.json (if you don't already have one):

```
npm init -y
```

Install the `node-esm-hmr` package:

```
npm i --save-dev node-esm-hmr
```

Add `"type":"module"` to your `package.json`

```json
{
  "name": "Example app",
  "version": "1.0.0",
  "...": "...",

  "type": "module",

  "...": "..."
}
```

Create a file called `foo.js` and add:

```javascript
// foo.js
import hmr from 'node-esm-hmr';

hmr('./bar.js', '.', (module) => {
  module.default(
    'this is a parameter that will be passed on to the default export of bar.js'
  );
});
```

Now make a file called bar.js:

```javascript
// bar.js
export default function (someArgument) {
  console.log('Hello world! ', someArgument);
}
```

Then run it with

```
node foo.js
```

It should print out:

```
Hello world! this is a parameter that will be passed on to the default export of bar.js
```

Now go back in and edit `bar.js`. Let's add a few more exclamation marks:

```javascript
// bar.js
export default function (someArgument) {
  console.log('Hello world!!!!!!!!!! ', someArgument);
}
```

Once you click save, you should see the change in the terminal! :tada:

```
Hello world! this is a parameter that will be passed on to the default export of bar.js
Hello world!!!!!!!!!! this is a parameter that will be passed on to the default export of bar.js
```

:bulb: Pro tip: If you want to make the previous output clear from the console after each HMR reload, you can simply add a `console.clear` to your callback function:

```javascript
// foo.js
hmr('./bar.js', '.', (module) => {
  console.clear();
  module.default(
    'this is a parameter that will be passed on to the default export of bar.js'
  );
});
```

## Disclaimer

**Do not use this in production!! This package is intended to help you while developing in your dev enviroment!**

In order to get dynamic imports work multiple times (which is the whole basis of how this package works) I had to use a dirty strategy for invalidating node's import cache. This hasn't broken anything from what I can tell, but it also might break at scale and might cause other issues in the long run (like a gradual memory leak and eventual crash if you keep the process running for way too long).

Anyways, you should be perfectly fine running this while developing (worse case if it crashes or starts using too much memory just kill it `cntrl / cmd + C` and start it again, just don't don't use this for anything mission critical or produciton ready without testing this nuance first.

## Credits / Prior Art

This package is 100% inspired by [node-hmr](https://github.com/serhiinkh/node-hmr). I decided to create this package when I first tried using node-hmr and realized that it doesn't work at all for ESM. Initially, I considered sending a PR, but I realized that ESM makes it pretty much nesicarry to rewrite most of it, and they also make it a lot simpler.

This package on it's doesn't really do much on it's own (it's really lightweight), all the file-watching magic is provided by [Chokidar](https://github.com/paulmillr/chokidar) which is an amazing cross-platform file watcher.

And, of course, thank you to [@Jasper De Moor](https://github.com/DeMoorJasper) who first explained to me what HMR was many years back while we were working on contributing to [Parcel](https://parceljs.org/) — the most amazing bundler on the planet.

This package is created and actively maintained by [David Nagli](https://www.linkedin.com/in/davidnagli/) and available under the [MIT License](https://github.com/davidnagli/node-esm-hmr/blob/main/LICENSE)

## Todo

- [ ] Create an optional ignore regex argument (really easy, just need to pass it to chokidar)

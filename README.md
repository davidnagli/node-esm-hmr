# Node ESM HMR
HMR for vanilla Node.js that actually works with Node's ESM imports (`"type":"module"` in package.json or `*.mjs` files)

## Why
reasoning for hmr on node
explain why just using a file watcher + dynamic imports doesn't work
it's really small and lightweight anyways, probably the same thing you would have written yourself

## How?
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

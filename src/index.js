import path from 'path';
import chokidar from 'chokidar';
import parentModule from 'parent-module';

export default async function hmr(modulePath, watch = '.', callback) {
  //(we need to import the module from this file so we need to resolve it's path relative to this file)
  const pathToImport = calculatePathToImport(modulePath);

  // This counter is used to break node's ESM import cache
  let i = 0;

  // First time just load it
  let importedModule = await import(
    `${pathToImport}?cacheBreaker=${String(i++)}`
  );
  callback(importedModule);

  // Load it again after file changes
  chokidar.watch(watch).on('change', async () => {
    importedModule = await import(
      `${pathToImport}?cacheBreaker=${String(i++)}`
    );
    callback(importedModule);
  });
}

function calculatePathToImport(modulePath) {
  // Get the path of the module that called this module
  const parentModuleRawPath = parentModule();
  if (!parentModuleRawPath)
    throw new Error(
      'Could not find parent module. Are you sure you are using this function in a module?'
    );

  // Get the path of the module's parent directory
  const parentModuleDirectoryPath = path.dirname(
    new URL(parentModuleRawPath).pathname
  );

  console.log('parentModuleDirectoryPath', parentModuleDirectoryPath);

  // Get absolute path of module's parent directory
  const absoluteModulePath = path.resolve(
    parentModuleDirectoryPath,
    modulePath
  );

  // Get this file's (yes, this one that you're reading right now) directory's path
  const currentDirectoryPath = path.dirname(new URL(import.meta.url).pathname);

  // Get relative path from current directory to module path
  const relativeModulePath = path.relative(
    currentDirectoryPath,
    absoluteModulePath
  );

  //Convert to unix path if needed:
  const normalizedRelativeModulePath = relativeModulePath.replace(/\\/g, '/');

  // All file imports in Node need to start with './' otherwise Node will think it's a package import
  const pathToImport = './' + normalizedRelativeModulePath;

  return pathToImport;
}

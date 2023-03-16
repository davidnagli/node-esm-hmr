import path from 'path';
import chokidar from 'chokidar';
import parentModule from 'parent-module';

export default async function hmr(modulePath, watch = '.', callback) {
  //(we need to import the module from this file so we need to resolve it's path relative to this file)

  // Resolve the absolute path of the module
  const parentModuleDirectoryPath = path.dirname(
    new URL(parentModule()).pathname
  );
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

  // This counter is used to break node's ESM import cache
  let i = 0;

  // First time just load it
  let abc = await import(
    `${normalizedRelativeModulePath}?cacheBreaker=${String(i++)}`
  );
  callback(abc);

  // Load it again after file changes
  chokidar.watch(watch).on('change', async () => {
    abc = await import(
      `${normalizedRelativeModulePath}?cacheBreaker=${String(i++)}`
    );
    callback(abc);
  });
}

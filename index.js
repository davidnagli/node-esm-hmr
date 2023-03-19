import path from 'path';
import chokidar from 'chokidar';
import parentModule from 'parent-module';
import chalk from 'chalk';

const ERROR_STRINGS = {
  INVALID_FILE_PATH: chalk.bold(
    `${chalk.bgRed(
      '❌ Node ESM HMR Critical Error'
    )} Invalid or malformed file path`
  ),
  FIRST_IMPORT_FAILED: chalk.bold(
    `${chalk.bgYellow(
      '⚠️ Node ESM HMR Warning'
    )} Module import failed (initial) - Did you change the file path or location? You might need to restart to see changes`
  ),
  WATCH_IMPORT_FAILED: chalk.bold(
    `${chalk.bgYellow(
      '⚠️ Node ESM HMR Warning'
    )} Module import failed (on change) - Did you change the file path or location? You might need to restart to see changes`
  ),
  EXECUTION_ERROR: chalk.bold(
    `${chalk.bgYellow(
      '⚠️ Node ESM HMR Warning'
    )} An unexpected error occurred while executing your callback function. Waiting for changes...`
  ),
  CATCH_ALL: `${chalk.bgRed.bold(
    'Node ESM HMR Error'
  )} - An unexpected error occurred:`,
};

export default async function hmr(
  modulePath,
  watch = '.',
  callback,
  clearEveryTime = true
) {
  try {
    let pathToImport;

    try {
      // We need to import the module from this file so we need to resolve it's path relative to this file
      // but the path given to us relative to the calling file.
      // So we need to get the path of the calling file, then resolve the path relative to that file.
      const parentModuleRawPath = parentModule();
      pathToImport = calculatePathToImport(modulePath, parentModuleRawPath);
    } catch (err) {
      log(ERROR_STRINGS.INVALID_FILE_PATH, err);
      return; // Return early if there is a problem with the file path
    }

    // This counter is used to break node's ESM import cache
    let i = 0;
    let importedModule;

    // First time just load it
    try {
      importedModule = await import(
        `${pathToImport}?cacheBreaker=${String(i++)}`
      );
    } catch (err) {
      log(ERROR_STRINGS.FIRST_IMPORT_FAILED, err);
      return; // Return early if there is a problem with the file path
    }

    // and then execute it
    try {
      importedModule && callback(importedModule);
    } catch (err) {
      log(ERROR_STRINGS.EXECUTION_ERROR, err, modulePath);
    }
    // Now we add a file watcher for subsequent changes
    chokidar.watch(watch).on('change', async () => {
      if (clearEveryTime) {
        console.clear();
        console.log(
          chalk.bold(
            chalk.bgGreenBright(' Node HMR ') +
              ' Restarted Successfully on File Change'
          )
        );
      }
      try {
        importedModule = await import(
          `${pathToImport}?cacheBreaker=${String(i++)}`
        );
      } catch (err) {
        log(ERROR_STRINGS.WATCH_IMPORT_FAILED, err);
        return; // Return early if there is a problem with the file path
      }

      try {
        importedModule && callback(importedModule);
      } catch (err) {
        log(ERROR_STRINGS.EXECUTION_ERROR, err, modulePath);
      }
    });
  } catch (err) {
    log(ERROR_STRINGS.CATCH_ALL, err);
  }
}

function calculatePathToImport(modulePath, parentModuleRawPath) {
  debugLog(
    '\n\n' +
      `--- calculatePathToImport (${modulePath}, ${parentModuleRawPath}) ---`
  );

  // Get the path of the module that called this module
  if (!parentModuleRawPath)
    throw new Error(
      'Could not find parent module. Are you sure you are using this function in a module?'
    );

  debugLog('parentModuleRawPath: ', parentModuleRawPath);

  // Get the path of the module's parent directory
  const parentModuleDirectoryPath = path.dirname(
    new URL(parentModuleRawPath).pathname
  );
  debugLog('parentModuleDirectoryPath: ', parentModuleDirectoryPath);

  // Get absolute path of module's parent directory
  const absoluteModulePath = path.resolve(
    parentModuleDirectoryPath,
    modulePath
  );

  debugLog('absoluteModulePath: ', absoluteModulePath);

  // Get this file's (yes, this one that you're reading right now) directory's path
  const currentDirectoryPath = path.dirname(new URL(import.meta.url).pathname);
  debugLog('currentDirectoryPath: ', currentDirectoryPath);

  // Get relative path from current directory to module path
  const relativeModulePath = path.relative(
    currentDirectoryPath,
    absoluteModulePath
  );
  debugLog('relativeModulePath: ', relativeModulePath);

  //Convert to unix path if needed:
  const normalizedRelativeModulePath = relativeModulePath.replace(/\\/g, '/');
  debugLog('normalizedRelativeModulePath: ', normalizedRelativeModulePath);

  // All file imports in Node need to start with './' otherwise Node will think it's a package import
  const pathToImport = './' + normalizedRelativeModulePath;
  debugLog('pathToImport: ', pathToImport);

  return pathToImport;
}

function log(message, err, fileToFix) {
  console.log('\n' + message);
  console.log('\t' + err + '\n');
  fileToFix &&
    console.log(
      chalk.bold.green(`Waiting for changes to ${fileToFix}...` + '\n')
    );
}

function debugLog(...args) {
  // console.log(...args);
}

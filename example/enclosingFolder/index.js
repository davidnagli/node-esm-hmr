import hmr from '../../index.js';

hmr('./inSameDir.js', '.', (bar) => {
  bar.default('a', 'b');
  bar.namedExport('a', 'b');
});

hmr('./nested/nestedExample.js', '.', (bar) => {
  bar.default('a', 'b');
  bar.namedExport('a', 'b');
});

hmr('../exampleInParent.js', '.', (bar) => {
  bar.default('a', 'b');
  bar.namedExport('a', 'b');
});

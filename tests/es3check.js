/*
 * This file is to test the compatibility with ECMAScript 3 by parsing it with
 * JavaScript parser, Acorn, with ecmaVersion set to '3'.
 */
var acorn = require('../vendor/acorn.js');
var fs    = require('fs');

try {
  var source = "./lib/index.js"
  var code = fs.readFileSync(source, 'utf8');

  acorn.parse(code, {
    /*
     * ecmaVersion: Indicates the ECMAScript version to parse. Can be a number,
     * either in year (2022) or plain version number (6) form, or "latest" (the
     * latest the library supports). This influences support for strict mode,
     * the set of reserved words, and support for new syntax features.
     */
    ecmaVersion: 3,
    /*
     * sourceType: Indicate the mode the code should be parsed in. Can be
     * either "script", "module" or "commonjs". This influences global strict
     * mode and parsing of import and export declarations.
     */
    sourceType: 'script',
    /*
     * allowReserved: If false, using a reserved word will generate an error.
     * Defaults to true for ecmaVersion 3, false for higher versions. When
     * given the value "never", reserved words and keywords can also not be
     * used as property names (as in Internet Explorer's old parser).
     */
    allowReserved: false,
    /*
     * locations: When true, each node has a loc object attached with start and
     * end subobjects, each of which contains the one-based line and zero-based
     * column numbers in {line, column} form. Default is false.
     */
    locations: false
  });

  console.log("Syntax is ES3 Compatible");
} catch (err) {
  console.error('Syntax is not ES3 Compatible! Error:', err.message);
  process.exit(1);
}

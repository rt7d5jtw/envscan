var acorn = require('../vendor/acorn.js');
var fs    = require('fs');

try {
  var source = "./lib/index.js"
  var code = fs.readFileSync(source, 'utf8');

  acorn.parse(code, {
    ecmaVersion: 3,
    sourceType: 'script',
    allowReserved: true,
    locations: false
  });

  console.log("Syntax is ES3 Compatible");
} catch (err) {
  console.error('Syntax is not ES3 Compatible! Error:', err.message);
  process.exit(1);
}

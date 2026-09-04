# Environment File Parser (ES3 Compliant)

### About

EnvParser is a utility designed to **parse environment variable (`.env`) files**. It reads key-value pairs and stores them in a standard **JavaScript Object**.

The parser includes support for:

* Handling **comments** (`#` or `;`) and whitespace.
* **Variable expansion** (interpolation) using the `${VAR}` syntax, prioritizing variables defined within the file over the host system's environment variables.
* Parsing **multiline string values** (e.g., for RSA keys) enclosed in double quotes (`"`).

### Compatibility and Style

The parser code is intentionally written using **ECMAScript 3 (ES3) syntax** (var, prototypes, plain objects) and wrapped in a Universal Module Definition (UMD) to attempt to guarantee portability across modern Node.js environments, web browsers, and legacy JavaScript engines like SpiderMonkey and Rhino.

⚠️ **Injecting Environment Variables:** Because this module attemtps to be platform-agnostic, it does not automatically read system environment variables. This is used for interpolated strings from the existing host environment variables. To enable variable expansion using the host's environment, you must manually add them before parsing:

```javascript
var EnvParser = require('./lib/index.js');
var tokenizer = new EnvParser(fileBuffer);

// Add the host environment (Node.js example)
tokenizer.setEnvironmentalVariables(process.env);

var config = tokenizer.tokenize();
```

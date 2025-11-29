# Environment File Parser (ES3 Compliant)

### About

EnvParser is a utility designed to **parse environment variable (`.env`) files**. It reads key-value pairs and stores them in a standard **JavaScript Object**.

The parser includes support for:

* Handling **comments** (`#` or `;`) and whitespace.
* **Variable expansion** (interpolation) using the `${VAR}` syntax, prioritizing variables defined within the file over the host system's environment variables.
* Parsing **multiline string values** (e.g., for RSA keys) enclosed in double quotes (`"`).

### Compatibility and Style

The parser code is intentionally written using **ECMAScript 3 (ES3) syntax** (var, prototypes, plain objects) for maximum portability and system compatibility.

⚠️ **Note on Platform Dependency:** While the syntax is ES3, this module is built for and requires a **Node.js runtime** to function due to its reliance on system modules (`process`, `fs`).

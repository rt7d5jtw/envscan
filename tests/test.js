/* made to be compatible for ES3 engines */
var testResults = {
  passed: 0,
  failed: 0,
  errors: []
}

function assert(condition, message)
{
  if (condition)
  {
    testResults.passed += 1;
  }
  else
  {
    testResults.failed += 1
    testResults.errors[testResults.errors.length] = message;
  }
}

function log(message)
{
  if (typeof document !== "undefined")
  {
    var outputElement = document.getElementById("test-output");
    if (outputElement)
    {
      outputElement.innerHTML += message + "\n";
    }
  }
  else if (typeof WScript !== "undefined")
  {
    WScript.Echo(message);
  }
  else if (typeof console.log !== "undefined")
  {
    console.log(message);
  }
  else
  {
    alert(message);
  }
}

function serializeObject(object) {
  var buffer = "{\n"
  var spaces = "  "
  var isFirst = true;

  for (var key in object)
  {
    if (Object.prototype.hasOwnProperty.call(object, key))
    {
      var value = object[key];
      if (isFirst == false)
      {
        buffer += ",\n";
      }

      buffer += spaces + '"' + key + '": "' + value + '"';

      isFirst = false;
    }
  }
  buffer += "\n}\n";

  return buffer
}

var Parser;
var envfile = "USER=testuser\nDOMAIN=example.org\nADMIN_EMAIL=admin@example.org\nROOT_URL=example.org/app\nSOME_URL=SOMEVARIABLE/cache\nTEST_URL=testuser/data";

if (typeof require !== "undefined")
{
  Parser = require('../lib/index.js')
}
else if (typeof EnvParser !== "undefined")
{
  Parser = EnvParser;
}
else
{
  throw new Error("Could not find EnvParser in this environment!")
}

var tokenizer = new Parser(envfile);
var env = tokenizer.tokenize()

assert(env['USER'] === 'testuser', "USER should be \"testuser\"");
assert(env['DOMAIN'] === 'example.org', "DOMAIN should be \"example.org\"");
assert(env['ADMIN_EMAIL'] === 'admin@example.org', "ADMIN_EMAIL should be \"admin@example.org\"");

var msg = "--- TEST SUMMARY ---\n"
msg += "Passed: " + testResults.passed + "\n";
msg += "Failed: " + testResults.failed + "\n";
if (testResults.failed > 0)
{
  msg += "\nFAILURE DETAILS:\n";
  for (var idx = 0; idx < testResults.errors.length; idx += 1)
  {
    msg += "- " + testResults.errors[idx] + "\n";
  }
}
else if (testResults.failed === 0)
{
  log("--- Environment Variables ---")
  var serializedEnvFile = serializeObject(env);
  log(serializedEnvFile);
  msg += "\n--- Environment file successfully parsed ---";
}

log(msg);

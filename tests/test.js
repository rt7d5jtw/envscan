/* Made to be compatible for EcmaScript 3 engines */
var testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

var currentSuite = "";
var suiteOrder = [];
var suiteStats = {};

function setSuite(name) {
  currentSuite = name;
  suiteOrder[suiteOrder.length] = name;
  suiteStats[name] = { passed: 0, failed: 0 };
}

function assert(condition, message) {
  if (condition) {
    testResults.passed += 1;
    if (currentSuite && suiteStats[currentSuite]) {
      suiteStats[currentSuite].passed += 1;
    }
  } else {
    testResults.failed += 1;
    testResults.errors[testResults.errors.length] = message;
    if (currentSuite && suiteStats[currentSuite]) {
      suiteStats[currentSuite].failed += 1;
    }
  }
}

function log(message) {
  if (typeof document !== "undefined") {
    var outputElement = document.getElementById("test-output");
    if (outputElement) {
      var htmlMessage = message.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
      outputElement.innerHTML += htmlMessage + "<br>";
    }
  } else if (typeof WScript !== "undefined") {
    WScript.Echo(message);
  } else if (typeof console !== "undefined" && typeof console.log !== "undefined") {
    console.log(message);
  } else {
    alert(message);
  }
}

function formatPreview(label, obj, maxEntries) {
  var count = 0;
  var out = "  [ " + label + " ]\n";
  for (var k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      count += 1;
      if (!maxEntries || count <= maxEntries) {
        var val = obj[k];
        if (typeof val === "string") {
          val = val.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
          if (val.length > 38) {
            val = val.substring(0, 35) + "...";
          }
        }
        out += "    " + k + " = \"" + val + "\"\n";
      }
    }
  }
  if (maxEntries && count > maxEntries) {
    out += "\n    ... (" + (count - maxEntries) + " more entries omitted)\n";
  }
  return out;
}

function getJavaScriptEngineInfo() {
  if (typeof ScriptEngine === "function") {
    return ScriptEngine() + " " + ScriptEngineMajorVersion() + "." + ScriptEngineMinorVersion();
  }
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    return "Node V8 (v" + process.versions.node + ")";
  }
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    var userAgent = navigator.userAgent;
    var firefox = userAgent.match(/Firefox\/([0-9.]+)/);
    if (firefox) {
      return "SpiderMonkey (Firefox " + firefox[1] + ")";
    }
    return "Web Browser (" + navigator.appName + ")";
  }
  return "Unknown JavaScript Engine";
}

var Parser;
if (typeof require !== "undefined") {
  Parser = require('../lib/index.js');
} else if (typeof EnvParser !== "undefined") {
  Parser = EnvParser;
} else {
  throw new Error("Could not find EnvParser in this environment!");
}

/* --- TEST SUITE 1: Basic Parsing and Trimming --- */
setSuite("Suite 1: Basic Parsing & Trimming");
var envfile1 = "USER=testuser\n  SPACED_KEY=spaced_value  \nDOMAIN=example.org";
var tokenizer1 = new Parser(envfile1);
var env1 = tokenizer1.tokenize();
assert(env1['USER'] === 'testuser', "Basic: USER should be \"testuser\"");
assert(env1['SPACED_KEY'] === 'spaced_value', "Whitespace: Values should be trimmed");
assert(env1['DOMAIN'] === 'example.org', "Basic: DOMAIN should be \"example.org\"");

/* --- TEST SUITE 2: Comments and Multiline Strings --- */
setSuite("Suite 2: Comments & Multiline Strings");
var envfile2 = "# Header comment line\nKEY1=value1\n# Second comment line\nKEY2=value2\nMULTILINE=\"line1\nline2\nline3\"";
var tokenizer2 = new Parser(envfile2);
var env2 = tokenizer2.tokenize();
assert(env2['KEY1'] === 'value1', "Comments: Should parse KEY1 alongside comments");
assert(env2['KEY2'] === 'value2', "Comments: Should parse KEY2 alongside comments");
assert(env2['MULTILINE'] === "line1\nline2\nline3", "Multiline: Should parse strings enclosed in double quotes containing newlines");

/* --- TEST SUITE 3: Variable Interpolation --- */
setSuite("Suite 3: Variable Interpolation");
var envfile3 = "BASE_DIR=/var/www\nAPP_DIR=${BASE_DIR}/app\nHOST_VAR=${SYSTEM_USER}\nMISSING_VAR=${DOES_NOT_EXIST}";
var tokenizer3 = new Parser(envfile3);
tokenizer3.setEnvironmentalVariables({ "SYSTEM_USER": "admin" });
var env3 = tokenizer3.tokenize();
assert(env3['BASE_DIR'] === '/var/www', "Interpolation: BASE_DIR should be \"/var/www\"");
assert(env3['APP_DIR'] === '/var/www/app', "Interpolation: Should expand internally defined variables");
assert(env3['HOST_VAR'] === 'admin', "Interpolation: Should expand variables from the host environment");
assert(env3['MISSING_VAR'] === 'DOES_NOT_EXIST', "Interpolation: Should return literal variable name if undefined");

/* --- TEST SUITE 4: Error Handling --- */
setSuite("Suite 4: Missing Separator Error Handling");
var envfile4 = "INVALID_LINE_WITHOUT_EQUALS";
var tokenizer4 = new Parser(envfile4);
var caughtError = false;
try {
  tokenizer4.tokenize();
} catch (e) {
  caughtError = true;
}
assert(caughtError === true, "Errors: Should throw an error for missing '=' separator");

/* --- TEST SUITE 5: Syntax Edge Cases & Delimiters --- */
setSuite("Suite 5: Delimiters & Edge Cases");
var envEquals = "DATABASE_URL=postgres://user:pass@localhost:5432/db?ssl=true&timeout=30\nEQUALS_DATA=a=b=c";
var tokEquals = new Parser(envEquals);
var resEquals = tokEquals.tokenize();
assert(resEquals['DATABASE_URL'] === 'postgres://user:pass@localhost:5432/db?ssl=true&timeout=30', "Delimiter: Should preserve subsequent '=' characters inside the value");
assert(resEquals['EQUALS_DATA'] === 'a=b=c', "Delimiter: Should handle multiple assignment signs");

var envVarNames = "_CONFIG_VAL_1=alpha\nAPP_PORT_8080=8080\n__INTERNAL__=true";
var tokVarNames = new Parser(envVarNames);
var resVarNames = tokVarNames.tokenize();
assert(resVarNames['_CONFIG_VAL_1'] === 'alpha', "Keys: Identifiers starting with underscore should be valid");
assert(resVarNames['APP_PORT_8080'] === '8080', "Keys: Identifiers with internal numbers should be valid");
assert(resVarNames['__INTERNAL__'] === 'true', "Keys: Identifiers with leading and trailing underscores should be valid");

var envEmptyAndPadded = "EMPTY_VAL=\n  SPACED_KEY_NAME  =value";
var tokEmptyAndPadded = new Parser(envEmptyAndPadded);
var resEmptyAndPadded = tokEmptyAndPadded.tokenize();
assert(resEmptyAndPadded['EMPTY_VAL'] === '', "Values: Empty assignment should evaluate to empty string");
assert(resEmptyAndPadded['SPACED_KEY_NAME'] === 'value', "Whitespace: Whitespace inside key tokens should be stripped");

var envCRLF = "LINE_ONE=1\r\nLINE_TWO=2\r\nLINE_THREE=3\r\n";
var tokCRLF = new Parser(envCRLF);
var resCRLF = tokCRLF.tokenize();
assert(resCRLF['LINE_ONE'] === '1' && resCRLF['LINE_TWO'] === '2' && resCRLF['LINE_THREE'] === '3', "Newlines: Windows-style \\r\\n carriage returns must not leave trailing \\r on values");

/* --- TEST SUITE 6: Advanced Error Handling --- */
setSuite("Suite 6: EOF & Syntax Error Handling");
var envErrEOF = "INVALID_KEY_AT_EOF";
var caughtErrEOF = false;
try {
  new Parser(envErrEOF).tokenize();
} catch (e1) {
  caughtErrEOF = true;
}
assert(caughtErrEOF === true, "Errors: Alphabetic token cut off at EOF without '=' must throw");

var envErrCR = "ORPHAN_KEY\r\nNEXT_KEY=val";
var caughtErrCR = false;
try {
  new Parser(envErrCR).tokenize();
} catch (e2) {
  caughtErrCR = true;
}
assert(caughtErrCR === true, "Errors: Identifier followed by \\r before '=' must throw");

var envTrailingComments = "\n\n# Lonely comment\n   \n# Another isolated comment\n\n";
var caughtErrTrailing = false;
try {
  new Parser(envTrailingComments).tokenize();
} catch (e3) {
  caughtErrTrailing = true;
}
assert(caughtErrTrailing === false, "Edge Cases: File containing only blank lines and comments should not throw");

/* --- TEST SUITE 7: Complex Interpolation Scenarios --- */
setSuite("Suite 7: Complex Interpolation & Precedence");
var envMultiExpand = "PROT=https\nHOST=localhost\nPORT=3000\nAPI_URL=${PROT}://${HOST}:${PORT}/v1";
var tokMultiExpand = new Parser(envMultiExpand);
var resMultiExpand = tokMultiExpand.tokenize();
assert(resMultiExpand['API_URL'] === 'https://localhost:3000/v1', "Interpolation: Multiple expansions on a single line should concatenate cleanly");

var envPrecedence = "SCOPE=local\nTARGET=${SCOPE}";
var tokPrecedence = new Parser(envPrecedence);
tokPrecedence.setEnvironmentalVariables({ "SCOPE": "system" });
var resPrecedence = tokPrecedence.tokenize();
assert(resPrecedence['TARGET'] === 'local', "Interpolation: File-level definitions must take precedence over host environment variables");

/* --- TEST SUITE 8: Large File & Throughput Test --- */
setSuite("Suite 8: High Throughput (1,500 Records)");
var largeFileLines = [];
var TOTAL_RECORDS = 1500;

for (var i = 0; i < TOTAL_RECORDS; i += 1) {
  if (i % 10 === 0) {
    largeFileLines[largeFileLines.length] = "# Checkpoint comment at index " + i;
  }
  largeFileLines[largeFileLines.length] = "GEN_KEY_" + i + "=gen_value_" + i;
}

var largeFilePayload = largeFileLines.join("\n");
var tokLarge = new Parser(largeFilePayload);
var resLarge = tokLarge.tokenize();

var parsedCount = 0;
for (var parsedKey in resLarge) {
  if (Object.prototype.hasOwnProperty.call(resLarge, parsedKey)) {
    parsedCount += 1;
  }
}

assert(parsedCount === TOTAL_RECORDS, "Stress Test: Exactly " + TOTAL_RECORDS + " records should be parsed");
assert(resLarge['GEN_KEY_0'] === 'gen_value_0', "Stress Test: First record must match");
assert(resLarge['GEN_KEY_750'] === 'gen_value_750', "Stress Test: Midpoint record must match");
assert(resLarge['GEN_KEY_' + (TOTAL_RECORDS - 1)] === 'gen_value_' + (TOTAL_RECORDS - 1), "Stress Test: Final record must match");

/* --- RENDER OUTPUT --- */
var report = "==================================================\n";
report += "               PARSER TEST SUITES                 \n";
report += "==================================================\n";

for (var sIdx = 0; sIdx < suiteOrder.length; sIdx += 1) {
  var sName = suiteOrder[sIdx];
  var stats = suiteStats[sName];
  var total = stats.passed + stats.failed;
  var badge = (stats.failed === 0) ? "[PASS]" : "[FAIL]";
  report += "  " + badge + " " + sName + " (" + stats.passed + "/" + total + ")\n";
}

report += "\n---------------- PARSED SAMPLES ------------------\n";
report += formatPreview("Suite 2: Multiline String Result", env2);
report += "\n";
report += formatPreview("Suite 3: Interpolated Variables", env3);
report += "\n";
report += formatPreview("Suite 5: Edge Cases & Delimiters", resEquals);
report += "\n";
report += formatPreview("Suite 8: High-Throughput Preview", resLarge, 3);
report += "==================================================\n";

report += "\n--- TEST SUMMARY ---\n";
report += "Passed: " + testResults.passed + "\n";
report += "Failed: " + testResults.failed + "\n";

if (testResults.failed > 0) {
  report += "\nFAILURE DETAILS:\n";
  for (var idx = 0; idx < testResults.errors.length; idx += 1) {
    report += "- " + testResults.errors[idx] + "\n";
  }
} else {
  report += "\nPowered by: " + getJavaScriptEngineInfo();
}

log(report);

/*
 * WARNING: ES3 SYNTAX COMPATIBILITY ONLY.
 *
 * This test file is written using only ECMAScript 3 (ES3) syntax HOWEVER,
 * this code is NOT platform-independent; it has a fundamental dependency on
 * Node.js native modules and global objects (require, fs, path, process, node:test).
 *
 * It MUST be run in a Node.js environment to work properly.
 */
var nodeTest   = require('node:test');
var nodeAssert = require('node:assert');
var process    = require('node:process');
var fs         = require('fs');
var path       = require('path');

var EnvParser = require('../lib/index.js')

/**
 * Synchronously reads the file through {readFileSync}
 * Returns the file contents of the resolved file.
 * For example: filePath = .env
 *
 * @param {string} filePath
 * @return Result<FileBuffer>
 */
function loadFile(filePath, flag, enc) {
  // set default parameter
  flag = flag || "r";
  enc  = enc || "utf-8";

  var buffer = null;
  var err = null;

  try {
    var resolvedFilePath = path.resolve(process.cwd(), filePath);

    buffer = fs.readFileSync(resolvedFilePath, {
      encoding: enc,
      flag: flag,
    });

  } catch (exception) {
    err = exception
    return { buffer, err };
  }

  return { buffer, err };
}

nodeTest.test('Test .env2 parsing', function (t) {
  var result = loadFile('tests/.env2');
  var buffer = result.buffer
  var err = result.err

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  var tokenizer = new EnvParser(buffer)
  tokenizer.setEnvironmentalVariables(process.env);

  var env = tokenizer.tokenize()
  console.debug('Config =', env)

  nodeAssert.ok(
    env['USER']        === 'testuser'           &&
    env['DOMAIN']      === 'example.org'        &&
    env['ADMIN_EMAIL'] === 'admin@example.org'  &&
    env['ROOT_URL']    === 'example.org/app'    &&
    env['SOME_URL']    === 'SOMEVARIABLE/cache' &&
    env['TEST_URL']    === 'testuser/data'
  )
})

nodeTest.test('Test .env parsing', function (t) {
  var result = loadFile('tests/.env');
  var buffer = result.buffer
  var err    = result.err

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  var tokenizer = new EnvParser(buffer)
  tokenizer.setEnvironmentalVariables(process.env);

  var env = tokenizer.tokenize()
  console.debug('Config:', env)

  nodeAssert.ok(
    env['DB_PORT']        === '5432' &&
    env['JWT_SECRET']     === 'supersecretpassword' &&
    env['JWT_EXPIRATION'] === '3600' &&
    env['PRIVATE_KEY']    === "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCeJzObNCgZcwSizyClJUc/tn+lHxBm/9sg2wwSTHfspteV2Xel\nHSjhdiMUUAtGeTExFdKXcolD55AQa6WpHmQ8v0uQMchvBSa+R19tQ1PSlYDgSjQm\n2+y/1N7agABjl8teDuIXhlALN7g98bvXkOakC6/io2ZEh/5ddxAEyiGvkQIDAQAB\nAoGBAJjmTX4/boUsLc85cNY4tClkxwNchP8PXUrme0U1qLuikcrN9F4tUtim3kNF\nH6GCiYxrDK5ejVaZCS7W49IdD8ofPtLJTqxk8vsgTiEofRDQ8XPK6Wlu2Z/jLF8x\n1+x/HzBD90cHMoPVlqCjhND37UFapK5+KMVPR9gWHVjjVgABAkEA8qdbO5nDIR8f\naBJyZ0BoSoN97knOTvFGpENNByiylVY8dr/tZZu8jH81BAMrIp7E53H16IfihYut\n7tmt8vaEYQJBAKbaDJbjNLuQSG06GOS+4nqPd1G2as/xlmxKmw4VHL8tke/kk6MO\nxI0estfZTUjLAHech72ef4U9Qgd6rLAw+TECQC9YLfnUB3mH7AXPS5kPvQmE3GZI\n6kMG2oSkSPwzmZx/pe55hiVEHKbBDyQIRjtMBRkvaA6FrNHnrfkjacg1ByECQHD8\n3+Gd4qvRPPqaiRj+GqgcVxTCjvpaAx86Nl4G9fyQg28MPt4AtiFKVJnO0YMl1R8q\npNFHb9tubDRcYmy9/UECQHghjs/zKqufzat431lWcc8CDsctUXwOa6oPKosHHkIZ\ndSJ0hIBru+ERKenEpZPaawW+O70R9GlvMDciL0vEvGA=\n-----END RSA PRIVATE KEY-----" &&
    env['PORT']           === '8080' &&
    env['MODE']           === 'development'
  )
})

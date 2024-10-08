import * as nodeTest from 'node:test'
import * as nodeAssert from 'node:assert'

import { readFileSync } from "fs";
import { resolve } from "path";

import EnvScanner from '../lib/index.cjs'

/**
 * Synchronously reads the file through {readFileSync}
 * Returns the file contents of the resolved file.
 * For example: filePath = .env
 *
 * @param {string} filePath
 * @return Result<FileBuffer>
 */
function loadFile(filePath, flag = "r", enc = "utf-8") {
  let buffer = null;
  let err = null;

  try {
    const resolvedFilePath = resolve(process.cwd(), filePath);

    buffer = readFileSync(resolvedFilePath, {
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
  const { buffer, err } = loadFile('.env2');

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  const tokenizer = new EnvScanner(buffer)

  const envCfg = tokenizer.tokenize()
  console.debug(`Config:`, envCfg)

  nodeAssert.ok(
    envCfg.get('USER') === 'testuser' &&
    envCfg.get('DOMAIN') === 'example.org' &&
    envCfg.get('ADMIN_EMAIL') === 'admin@example.org' &&
    envCfg.get('ROOT_URL') === 'example.org/app' &&
    envCfg.get('SOME_URL') === 'SOMEVARIABLE/cache' &&
    envCfg.get('TEST_URL') === 'testuser/data'
  )
})

nodeTest.test('Test .env parsing', function (t) {
  const { buffer, err } = loadFile('.env');

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  const tokenizer = new EnvScanner(buffer)

  const envCfg = tokenizer.tokenize()
  console.debug(`Config:`, envCfg)

  nodeAssert.ok(
    envCfg.get('DB_PORT') === '5432' &&
    envCfg.get('JWT_SECRET') === 'supersecretpassword' &&
    envCfg.get('JWT_EXPIRATION') === '3600' &&
    envCfg.get('PRIVATE_KEY') === "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCeJzObNCgZcwSizyClJUc/tn+lHxBm/9sg2wwSTHfspteV2Xel\nHSjhdiMUUAtGeTExFdKXcolD55AQa6WpHmQ8v0uQMchvBSa+R19tQ1PSlYDgSjQm\n2+y/1N7agABjl8teDuIXhlALN7g98bvXkOakC6/io2ZEh/5ddxAEyiGvkQIDAQAB\nAoGBAJjmTX4/boUsLc85cNY4tClkxwNchP8PXUrme0U1qLuikcrN9F4tUtim3kNF\nH6GCiYxrDK5ejVaZCS7W49IdD8ofPtLJTqxk8vsgTiEofRDQ8XPK6Wlu2Z/jLF8x\n1+x/HzBD90cHMoPVlqCjhND37UFapK5+KMVPR9gWHVjjVgABAkEA8qdbO5nDIR8f\naBJyZ0BoSoN97knOTvFGpENNByiylVY8dr/tZZu8jH81BAMrIp7E53H16IfihYut\n7tmt8vaEYQJBAKbaDJbjNLuQSG06GOS+4nqPd1G2as/xlmxKmw4VHL8tke/kk6MO\nxI0estfZTUjLAHech72ef4U9Qgd6rLAw+TECQC9YLfnUB3mH7AXPS5kPvQmE3GZI\n6kMG2oSkSPwzmZx/pe55hiVEHKbBDyQIRjtMBRkvaA6FrNHnrfkjacg1ByECQHD8\n3+Gd4qvRPPqaiRj+GqgcVxTCjvpaAx86Nl4G9fyQg28MPt4AtiFKVJnO0YMl1R8q\npNFHb9tubDRcYmy9/UECQHghjs/zKqufzat431lWcc8CDsctUXwOa6oPKosHHkIZ\ndSJ0hIBru+ERKenEpZPaawW+O70R9GlvMDciL0vEvGA=\n-----END RSA PRIVATE KEY-----" &&
    envCfg.get('PORT') === '8080' &&
    envCfg.get('MODE') === 'development'
  )
})

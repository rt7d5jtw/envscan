import * as nodeTest from 'node:test'
import * as nodeAssert from 'node:assert'

import { readFileSync } from "fs";
import { resolve } from "path";

//import nodeUtil from 'node:util'
//import dotenv from 'dotenv'

import { EnvScannerImpl } from '../lib/index'
/**
 * Synchronously reads the file through {readFileSync}
 * Returns the file contents of the resolved file.
 * For example: filePath = .env
 * @param {string} filePath
 * @return Result<FileBuffer>
 */
function loadFile(filePath: string, flag = "r", enc: BufferEncoding = "utf-8") {
  let buffer = null;
  let err = null;

  try {
    const resolvedFilePath: string = resolve(process.cwd(), filePath);
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


/**
 * Main test runner.
 */

// For comparing what dotenv outputs from the env file
//const cfg = dotenv.config({ path: '.env' })
//console.debug(`dotenv comparison:`, cfg)

nodeTest.test('Test .env2 parsing', (t) => {
  const { buffer, err } = loadFile('.env2');

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  const tokenizer = new EnvScannerImpl(buffer as string)

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

//function _resolveRoot(envPath: string) {
//  return envPath[0] === '~' ? join(homedir(), envPath.slice(1)) : envPath
//}

// FOR PARSING THE ENV FILE
//console.log("--- TESTING ---");
//console.log(envSet('.env'));
//console.log("--- TESTING ---");
//console.log(process.env.MODE)

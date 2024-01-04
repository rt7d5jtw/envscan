import { TokenizerImpl, loadFile } from '../lib/index';
//import dotenv from 'dotenv'

/**
 * Main test runner.
 */

// For comparing what dotenv outputs from the env file
//const cfg = dotenv.config({ path: '.env' })
//console.debug(`dotenv comparison:`, cfg)

const fc = loadFile('.env2');

const tokenizer = new TokenizerImpl(fc);

//tokenizer.traverseToken()
const envCfg = tokenizer.tokenize()
console.debug(`Config:`, envCfg)

//function _resolveRoot(envPath: string) {
//  return envPath[0] === '~' ? join(homedir(), envPath.slice(1)) : envPath
//}

// FOR PARSING THE ENV FILE
//console.log("--- TESTING ---");
//console.log(envSet('.env'));
//console.log("--- TESTING ---");
//console.log(process.env.MODE)



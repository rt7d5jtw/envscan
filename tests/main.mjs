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
    envCfg.get('PRIVATE_KEY') === "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABBdLafISr\nvL1Jk6fp/R5N0+AAAAEAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIPmZPz6g1wdYCIoe\njRUzSHINV7xpmN5eAPccc1QJQXdgAAAAoPIrSTZJSW/11jQENi2GmnlpQdf0uqLkOcWE4K\nWpD2MM4f+tHb2Hu3VWGDIUdIMnRCSh1BoJJCfsLCzNKlw2tuUNrNk6Uz/bODLNiy06uv6x\nccC+cBg/lmlGANCSVJ0rAXGW/BfPe1+q0UtOXZlKRq0cZBd53VsXjh32k9h/LIwiRLpNLl\naWQ45WqgvQcQ7JpoH8EZ8Wk9a47/SSw4TH1uQ=\n-----END OPENSSH PRIVATE KEY-----" &&
    envCfg.get('PORT') === '8080' &&
    envCfg.get('MODE') === 'development'
  )
})

#!/usr/bin/env node

const path = require("node:path")
const Module = require("node:module")

// Ensure tsconfig-paths/register can always locate a concrete tsconfig.
// Medusa CLI loads tsconfig-paths very early, so we set this before requiring it.
if (!process.env.TS_NODE_PROJECT || process.env.TS_NODE_PROJECT.trim() === "") {
  process.env.TS_NODE_PROJECT = path.join(__dirname, "..", "tsconfig.json")
}

// Medusa CLI eagerly does `require("tsconfig-paths").register({})`.
// With current tsconfig-paths versions this throws (missing baseUrl/paths),
// which then makes Medusa print a misleading "ts-node cannot be loaded" warning.
// We intercept that require and return a safe shim.
const tsconfigPathsShim = require(path.join(
  __dirname,
  "shims",
  "node_modules",
  "tsconfig-paths"
))

const originalLoad = Module._load
// eslint-disable-next-line no-underscore-dangle
Module._load = function (request, parent, isMain) {
  if (request === "tsconfig-paths") {
    return tsconfigPathsShim
  }
  // @ts-ignore - Node internal API
  return originalLoad.call(this, request, parent, isMain)
}

require("@medusajs/cli/cli.js")

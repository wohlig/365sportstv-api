/**
 * Define Global Variables Here
 * global._ = require("lodash")
 */

global.paginationLimit = 10
global.each = require("lodash/each")
global.jwt = require("jsonwebtoken")
global.jwt_key = env["JWT_KEY"]
global.request = require("request")
global.q = require("q")
global.jwtDecode = require("jwt-decode")
// global.sha256 = require("js-sha256").sha256
global.randomize = require("randomatic")
global.CryptoJS = require("crypto-js")
global.crypto_key = env["CRYPTO_KEY"]
global._ = require("lodash")

import consts from "../../config/const"
import httprequest from "../../common/httpService.js"
import generateID from "../../common/getId"
import Plan from "../../mongooseModel/Plan.js"
import User from "../../mongooseModel/User.js"
import SubscriptionModel from "../../models/SubscriptionModel.js"
import Transaction from "../../mongooseModel/Transaction"
import axios from "axios"
const sha256 = require("./sha256")
class Payment {
    callApi(httpMethod, url, body, headers) {
        let deferred = q.defer()
        try {
            httprequest
                .call(httpMethod, url, body, headers)
                .then((response) => {
                    deferred.resolve(response)
                })
                .catch((error) => {
                    deferred.reject(error)
                })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
    async createTransaction(data) {
        let deferred = q.defer()
        try {
            let orderId = generateID.getId()
            const transactionObjToSave = {
                user: data.userId,
                amount: data.amount,
                plan: data.plan,
                order_id: orderId,
                currency: "INR",
                status: "pending",
                transactionType: "deposit",
                transactionWay: "Payment Gateway",
                paymentGatewayResponse: "",
                // userIpDetail: {
                //     ip: "139.59.38.31",
                //     country: "IN"
                // },
                paymentGatewayName: "apexpay"
            }

            const transactionObj = new Transaction(transactionObjToSave)
            // try {
            //     let user = await UserModel.getUserDetails({
            //         userId: data.userId
            //     })
            //     if (user && user.length) {
            //         _.merge(transactionObj, user[0])
            //     }
            // } catch (error) {
            //     console.log("Error::", error)
            // }
            transactionObj
                .save()
                .then((dbresponse) => {
                    if (_.isEmpty(dbresponse)) {
                        deferred.reject({
                            data: "Transaction not saved"
                        })
                    } else {
                        deferred.resolve(dbresponse)
                    }
                })
                .catch((error) => {
                    console.log(
                        "Error2: error occured while saving transaction",
                        error
                    )
                    deferred.reject(error)
                })
        } catch (error) {
            console.log("Error1: error occured while saving transaction", error)
            deferred.reject(error)
        }
        return deferred.promise
    }
    async renderPayment(transData) {
        let deferred = q.defer()
        try {
            const user = await User.findOne(
                { _id: ObjectId(transData.user) },
                { name: 1, _id: 1, mobile: 1 }
                // { name: 1, email: 1, _id: 1, mobileNo: 1 }
            )
            if (!_.isEmpty(user)) {
                let randomMobileNo = _.random(7000000000, 9999999999)
                const transactionDetails = {
                    purpose: transData.order_id,
                    amount: transData.amount * 100,
                    buyer: user.name,
                    email: "abc@xyz.com",
                    phone: user.mobile,
                    sportsTv_url:
                        consts.api +
                        "/Transaction/apexpay/redirecturl?p=" +
                        transData.order_id
                }
                // const consts = consts
                deferred.resolve(`<!DOCTYPE html
                    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <title>Apexpay Checkout</title>
                    <script>
                        /* <script type="text/javascript"> */
                        function submitForm() {
                            var form = document.forms[0];
                            inputElements = form.getElementsByClassName("signuptextfield");
                
                            var valueArray = new Array();
                            var sortedArray = new Array();
                            var nameArray = [];
                            for (i = 0; i < inputElements.length; i++) {
                                valueArray[inputElements[i].name] = inputElements[i].value;
                                nameArray[i] = inputElements[i].name;
                            }
                            nameArray.sort();
                            var inputString = "";
                            for (j = 0; j < nameArray.length; j++) {
                                var element = nameArray[j];
                                inputString += "~";
                                inputString += element;
                                inputString += "="
                                inputString += valueArray[element];
                            }
                            inputString = inputString.substr(1);
                            inputString += document.getElementById("hashkey").value;
                            var hash = Sha256.hash(inputString).toUpperCase();
                            document.getElementById("hash").value = hash;
                            form.action = "${consts.apexpayURL}";
                            form.submit();
                        }
                        class Sha256 {
                
                            /**
                             * Generates SHA-256 hash of string.
                             *
                             * @param   {string} msg - (Unicode) string to be hashed.
                             * @param   {Object} [options]
                             * @param   {string} [options.msgFormat=string] - Message format: 'string' for JavaScript string
                             *   (gets converted to UTF-8 for hashing); 'hex-bytes' for string of hex bytes ('616263' = 'abc') .
                             * @param   {string} [options.outFormat=hex] - Output format: 'hex' for string of contiguous
                             *   hex bytes; 'hex-w' for grouping hex bytes into groups of (4 byte / 8 character) words.
                             * @returns {string} Hash of msg as hex character string.
                             */
                            static hash(msg, options) {
                                const defaults = { msgFormat: 'string', outFormat: 'hex' };
                                const opt = Object.assign(defaults, options);
                
                                // note use throughout this routine of 'n >>> 0' to coerce Number 'n' to unsigned 32-bit integer
                
                                switch (opt.msgFormat) {
                                    default: // default is to convert string to UTF-8, as SHA only deals with byte-streams
                                    case 'string': msg = utf8Encode(msg); break;
                                    case 'hex-bytes': msg = hexBytesToString(msg); break; // mostly for running tests
                                }
                
                                // constants [§4.2.2]
                                const K = [
                                    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                                    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                                    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                                    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                                    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                                    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                                    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                                    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
                
                                // initial hash value [§5.3.3]
                                const H = [
                                    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
                
                                // PREPROCESSING [§6.2.1]
                
                                msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
                
                                // convert string msg into 512-bit blocks (array of 16 32-bit integers) [§5.2.1]
                                const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
                                const N = Math.ceil(l / 16);  // number of 16-integer (512-bit) blocks required to hold 'l' ints
                                const M = new Array(N);     // message M is N×16 array of 32-bit integers
                
                                for (let i = 0; i < N; i++) {
                                    M[i] = new Array(16);
                                    for (let j = 0; j < 16; j++) { // encode 4 chars per integer (64 per block), big-endian encoding
                                        M[i][j] = (msg.charCodeAt(i * 64 + j * 4 + 0) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16)
                                            | (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3) << 0);
                                    } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
                                }
                                // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
                                // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
                                // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
                                const lenHi = ((msg.length - 1) * 8) / Math.pow(2, 32);
                                const lenLo = ((msg.length - 1) * 8) >>> 0;
                                M[N - 1][14] = Math.floor(lenHi);
                                M[N - 1][15] = lenLo;
                
                
                                // HASH COMPUTATION [§6.2.2]
                
                                for (let i = 0; i < N; i++) {
                                    const W = new Array(64);
                
                                    // 1 - prepare message schedule 'W'
                                    for (let t = 0; t < 16; t++) W[t] = M[i][t];
                                    for (let t = 16; t < 64; t++) {
                                        W[t] = (Sha256.s1(W[t - 2]) + W[t - 7] + Sha256.s0(W[t - 15]) + W[t - 16]) >>> 0;
                                    }
                
                                    // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
                                    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
                
                                    // 3 - main loop (note '>>> 0' for 'addition modulo 2^32')
                                    for (let t = 0; t < 64; t++) {
                                        const T1 = h + Sha256.S1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
                                        const T2 = Sha256.S0(a) + Sha256.Maj(a, b, c);
                                        h = g;
                                        g = f;
                                        f = e;
                                        e = (d + T1) >>> 0;
                                        d = c;
                                        c = b;
                                        b = a;
                                        a = (T1 + T2) >>> 0;
                                    }
                
                                    // 4 - compute the new intermediate hash value (note '>>> 0' for 'addition modulo 2^32')
                                    H[0] = (H[0] + a) >>> 0;
                                    H[1] = (H[1] + b) >>> 0;
                                    H[2] = (H[2] + c) >>> 0;
                                    H[3] = (H[3] + d) >>> 0;
                                    H[4] = (H[4] + e) >>> 0;
                                    H[5] = (H[5] + f) >>> 0;
                                    H[6] = (H[6] + g) >>> 0;
                                    H[7] = (H[7] + h) >>> 0;
                                }
                
                                // convert H0..H7 to hex strings (with leading zeros)
                                for (let h = 0; h < H.length; h++) H[h] = ('00000000' + H[h].toString(16)).slice(-8);
                
                                // concatenate H0..H7, with separator if required
                                const separator = opt.outFormat == 'hex-w' ? ' ' : '';
                
                                return H.join(separator);
                
                                /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
                
                                function utf8Encode(str) {
                                    try {
                                        return new TextEncoder().encode(str, 'utf-8').reduce((prev, curr) => prev + String.fromCharCode(curr), '');
                                    } catch (e) { // no TextEncoder available?
                                        return unescape(encodeURIComponent(str)); // monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
                                    }
                                }
                
                                function hexBytesToString(hexStr) { // convert string of hex numbers to a string of chars (eg '616263' -> 'abc').
                                    const str = hexStr.replace(' ', ''); // allow space-separated groups
                                    return str == '' ? '' : str.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
                                }
                            }
                
                
                
                            /**
                             * Rotates right (circular right shift) value x by n positions [§3.2.4].
                             * @private
                             */
                            static ROTR(n, x) {
                                return (x >>> n) | (x << (32 - n));
                            }
                
                
                            /**
                             * Logical functions [§4.1.2].
                             * @private
                             */
                            static S0(x) { return Sha256.ROTR(2, x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); }
                            static S1(x) { return Sha256.ROTR(6, x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); }
                            static s0(x) { return Sha256.ROTR(7, x) ^ Sha256.ROTR(18, x) ^ (x >>> 3); }
                            static s1(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x >>> 10); }
                            static Ch(x, y, z) { return (x & y) ^ (~x & z); }          // 'choice'
                            static Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); } // 'majority'
                
                        }
                
                
                        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
                
                        if (typeof module != 'undefined' && module.exports) module.exports = Sha256(); // = export default Sha256
                    </script>
                    <style type="text/css">
                        body {
                            width: 100%;
                            margin: 0 auto;
                            background-color: #e4eff5;
                        }
                
                        .new {
                            width: 500px;
                            margin: 20px auto 0 auto;
                            padding: 0;
                            font: normal 12px arial;
                            color: #555;
                            background: #fff;
                            border: 1px solid #d0d0d0;
                            border-radius: 5px;
                            -webkit-box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                            -moz-box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                            box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                        }
                
                        .signupbox {
                            margin: 20px auto 0 auto;
                            padding: 0;
                            font: normal 12px arial;
                            color: #555;
                            background: #fff;
                            border: 1px solid #d0d0d0;
                            border-radius: 5px;
                            -webkit-box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                            -moz-box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                            box-shadow: -1px 3px 8px -1px rgba(0, 0, 0, 0.75);
                        }
                
                        .signup-headingbg {
                            background: #194e84;
                            background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
                            background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
                            background-size: 5px 5px;
                            height: 35px;
                            border-bottom: 1px solid #dadada;
                            font: bold 16px Tahoma;
                            color: #ffffff;
                            vertical-align: middle;
                        }
                
                        .signuptextfield {
                            display: block;
                            width: 98%;
                            height: 15px;
                            padding: 6px 7px;
                            margin-left: 10px;
                            font-size: 12px;
                            font-family: 'Titillium Web', sans-serif;
                            line-height: 1.428571429;
                            color: #555;
                            margin-bottom: 5px;
                            background-color: #fff;
                            background-image: none;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
                            box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
                            -webkit-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
                            transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
                        }
                
                        .signuptextfield:focus {
                            border-color: #66afe9;
                            outline: 0;
                            -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
                            box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
                        }
                
                        .labelfont {
                            font: bold 11px Arial;
                            color: #607a8c;
                            text-decoration: none;
                        }
                
                        .signupbutton {
                            background-color: #5cb85c;
                            border: 1px solid #4cae4c;
                            width: 40%;
                            height: 35px;
                            font: bold 14px Tahoma;
                            text-align: center;
                            color: #fff;
                            cursor: pointer;
                            border-radius: 5px;
                        }
                
                        .signupbutton:hover {
                            background-color: #449d44;
                            border: 1px solid #398439;
                            width: 40%;
                            height: 35px;
                            font: bold 14px Tahoma;
                            text-align: center;
                            color: #fff;
                            cursor: pointer;
                            border-radius: 5px;
                        }
                
                        .borderleftradius {
                            border-top-left-radius: 5px;
                        }
                
                        .borderrightradius {
                            border-top-right-radius: 5px;
                        }
                
                        .gradientbg {
                            /* IE10 Consumer Preview */
                            background-image: -ms-linear-gradient(top, #FEFEFF 0%, #BFD3E1 100%);
                
                            /* Mozilla Firefox */
                            background-image: -moz-linear-gradient(top, #FEFEFF 0%, #BFD3E1 100%);
                
                            /* Opera */
                            background-image: -o-linear-gradient(top, #FEFEFF 0%, #BFD3E1 100%);
                
                            /* Webkit (Safari/Chrome 10) */
                            background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FEFEFF), color-stop(1, #BFD3E1));
                
                            /* Webkit (Chrome 11+) */
                            background-image: -webkit-linear-gradient(top, #FEFEFF 0%, #BFD3E1 100%);
                
                            /* W3C Markup, IE10 Release Preview */
                            background-image: linear-gradient(to bottom, #FEFEFF 0%, #BFD3E1 100%);
                        }
                    </style>
                </head>
                <body onload="javascript:submitForm()" style="display: none">
                <div class="new">
                    <input type="text" name="PAY_ID" class="signuptextfield" style="display:none" id="hashkey"
                        value="${consts.apexpaySalt}" autocomplete="off" />
                    <form method="post">
                        <table width="500" border="0" align="center" cellpadding="0" cellspacing="0" class="gradientbg">
                            <tr style="display:none">
                                <td colspan="3" align="center" valign="middle"></td>
            
                            </tr>
                            <tr>
                                <td colspan="3" align="center" valign="middle"
                                    class="signup-headingbg borderleftradius borderrightradius">Checkout Page</td>
                            </tr>
                            <tr style="display:none">
                                <td align="right" valign="middle">&nbsp;</td>
                                <td align="center" valign="middle">&nbsp;</td>
                                <td align="center" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">PAY ID: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="PAY_ID"
                                        class="signuptextfield" value="${consts.apexpayPayId}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">ORDER ID: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" id="ORDER_ID" name="ORDER_ID"
                                        class="signuptextfield" value="${transactionDetails.purpose}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">AMOUNT: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="AMOUNT"
                                        class="signuptextfield" value="${transactionDetails.amount}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">TXNTYPE: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="TXNTYPE"
                                        class="signuptextfield" value="SALE" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
            
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">CUSTOMER EMAILID: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="CUST_EMAIL"
                                        class="signuptextfield" value="${transactionDetails.email}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">CUSTOMER NAME: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="CUST_NAME"
                                        class="signuptextfield" value="${user.name}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">CUSTOMER phone: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="CUST_PHONE"
                                        class="signuptextfield" value="${randomMobileNo}" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">CURRENCY CODE: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="CURRENCY_CODE"
                                        class="signuptextfield" value="356" autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
            
                                <td width="28%" align="right" valign="middle" class="labelfont">RETURN URL: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="RETURN_URL"
                                        class="signuptextfield" value="${transactionDetails.sportsTv_url}"
                                        autocomplete="off" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr style="display:none">
                                <td width="28%" align="right" valign="middle" class="labelfont">HASH: </td>
                                <td width="65%" align="left" valign="middle"><input type="text" name="HASH"
                                        class="signuptextfield11" value="" autocomplete="off" id="hash" /></td>
                                <td width="7%" align="left" valign="middle">&nbsp;</td>
                            </tr>
                            <tr>
                                <td colspan="3" align="center" valign="middle">&nbsp;</td>
                            </tr>
                            <tr>
                                <!-- <td width="50%" align="right" ></td> -->
                                <td colspan="3" align="center" valign="middle">
                                    <input type="submit" id="button" class="signupbutton" value="Pay Now"
                                        onclick="javascript:submitForm()" />
                                </td>
                            </tr>
                            <tr>
                                <td colspan="3" align="center" valign="middle">&nbsp;</td>
                            </tr>
                        </table>
                    </form>
                </div>
            </body>
                </html>`)
            } else {
                throw { message: "User not found" }
            }
        } catch (error) {
            console.log("Error1: error occured while rendering ", error)
            deferred.reject(error)
        }
        return deferred.promise
    }
    async initiatePayment(req, res) {
        let data = req.query
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "Plan not found"
                }
            })
            return
        }
        if (plan.price != data.amount) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "Amount not matching"
                }
            })
            return
        }
        const userData = await User.findOne({
            _id: data.userId,
            status: "enabled",
            mobileVerified: true
        })
        if (userData == null) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "User not found"
                }
            })
            return
        }
        const subscription = await Subscription.findOne({
            user: data.userId,
            planStatus: "pre-active"
        })
        if (subscription != null) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "User already subscribed"
                }
            })
            return
        }
        if (plan.price == 0) {
            if (userData.freeTrialUsed) {
                res.status(400).send({
                    status: 400,
                    message: "Bad Request",
                    error: {
                        message: "Free trial already used"
                    }
                })
                return
            }
            data.transactionType = "free"
            data.status = "completed"
            let orderId = generateID.getId()
            data.order_id = orderId
            data.user = data.userId
            let obj = new Transaction(data)
            await obj
                .save()
                .then(async (data) => {
                    await SubscriptionModel.saveData(data)
                })
                .then(async () => {
                    const user = await User.findOne({
                        _id: data.userId
                    })
                    let objToGenerateAccessToken = {
                        _id: user._id,
                        name: user.name,
                        mobile: user.mobile,
                        userType: user.userType,
                        currentPlan: user.planDetails
                    }
                    var token = jwt.sign(objToGenerateAccessToken, jwt_key)
                    res.status(200).json({ data: obj, accessToken: token })
                })
                .catch((err) => {
                    res.status(500).send({
                        status: 500,
                        message: "Internal server error",
                        error: err
                    })
                })
        } else {
            try {
                let PG = new Payment()
                let reqData = {}
                let data = req.query
                // data.userId = req.user._id
                reqData = data
                PG.createTransaction(reqData)
                    .then((transactionResponse) => {
                        return PG.renderPayment(transactionResponse)
                    })
                    .then((apexpayResponse) => {
                        res.send(apexpayResponse)
                    })
                    .catch((error) => {
                        console.log("Bad request (apexpay)", error)
                        res.status(400).send({
                            status: 400,
                            message: "Bad request",
                            error: error
                        })
                    })
            } catch (error) {
                console.log(error)
                res.status(500).send({
                    status: 500,
                    message: "Internal server error",
                    error: {
                        message: "oops something went wrong"
                    }
                })
            }
        }
    }
    verifyApexpay(order_id) {
        try {
            let apexpay = new Payment()
            apexpay
                .verifyApexpayPayment(order_id)
                .then((response) => {
                    return apexpay.save(response, order_id)
                })
                .then((fresponse) => {
                    console.log("SUCCESS")
                })
                .catch((error) => {
                    console.log(
                        "Error occured while fetching apexpay payments",
                        error
                    )
                })
        } catch (error) {
            console.log("Final erorr while fetching apexpay payments", error)
        }
    }
    async verifyApexpayPayment(order_id) {
        let deferred = q.defer()
        try {
            const transaction = await Transaction.findOne({
                order_id: order_id,
                status: "pending",
                paymentGatewayName: "apexpay"
            })
            if (transaction && transaction._id) {
                let headers = { "Content-Type": "application/json" }
                let currencyCode = 356
                let txnType = "STATUS"
                let inputString = `AMOUNT=${
                    transaction.amount * 100
                }~CURRENCY_CODE=${currencyCode}~ORDER_ID=${order_id}~PAY_ID=${
                    consts.apexpayPayId
                }~TXNTYPE=${txnType}`
                inputString += consts.apexpaySalt
                let hash = sha256.hash(inputString)
                hash = hash.toUpperCase()
                let body = {
                    PAY_ID: consts.apexpayPayId,
                    ORDER_ID: order_id,
                    AMOUNT: transaction.amount * 100,
                    TXNTYPE: txnType,
                    CURRENCY_CODE: currencyCode,
                    HASH: hash
                }
                const url = consts.apexPayStatusURL
                let apexpay = new Payment()
                apexpay
                    .callApi("POST", url, body, headers)
                    .then((response) => {
                        deferred.resolve(response)
                    })
                    .catch((error) => {
                        deferred.reject(error)
                    })
            }
        } catch (err) {
            console.log("error while fetching apexpay payments", err)
            deferred.reject(err)
        }
        return deferred.promise
    }
    async save(response, order_id) {
        try {
            let withoutHashResponse = _.omit(response, "HASH")
            const sorted_object = Object.keys(withoutHashResponse)
                .sort()
                .reduce((obj, key) => {
                    obj[key] = withoutHashResponse[key]
                    return obj
                }, {})
            let hashString = Object.keys(sorted_object)
                .map((key) => key + "=" + sorted_object[key])
                .join("~")
            hashString += consts.apexpaySalt
            let calculatedHash = sha256.hash(hashString).toUpperCase()
            let requestParams = {}
            let amount = response.AMOUNT ? response.AMOUNT / 100 : 0
            requestParams.order_id = order_id
            requestParams.transactionAmount = amount
            requestParams.response = response
            let apexpay = new Payment()
            if (response.HASH && response.HASH == calculatedHash) {
                if (
                    (response &&
                        response.RESPONSE_MESSAGE &&
                        response.RESPONSE_MESSAGE.toUpperCase() == "SUCCESS" &&
                        response.STATUS &&
                        response.STATUS.toUpperCase() == "CAPTURED" &&
                        response.RESPONSE_CODE &&
                        response.RESPONSE_CODE == "000") ||
                    (response &&
                        response.RESPONSE_MESSAGE &&
                        // response.RESPONSE_MESSAGE.toUpperCase() == "SUCCESS" &&
                        response.STATUS &&
                        response.STATUS.toUpperCase() == "SETTLED" &&
                        response.RESPONSE_CODE &&
                        response.RESPONSE_CODE == "000")
                ) {
                    apexpay.SuccessTransactionFunction(requestParams)
                } else if (
                    (response &&
                        response.STATUS &&
                        response.STATUS.toUpperCase() == "DECLINED") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toUpperCase() == "FAILED") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() ==
                            "failed at acquirer") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "rejected") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "cancelled") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "denied by risk") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "invalid") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "user inactive") ||
                    (response &&
                        response.STATUS &&
                        response.STATUS.toLowerCase() == "denied due to fraud")
                ) {
                    apexpay.FailureTransactionFunction(requestParams)
                }
            } else {
                requestParams.fairplayComment = "Hash Mismatch"
                apexpay.FailureTransactionFunction(requestParams)
            }
        } catch (err) {
            console.log("error while fetching apexpay payments", err)
        }
    }
    async SuccessTransactionFunction(dat) {
        var data = dat
        Transaction.findOne({
            order_id: data.order_id
        })
            .then(async (transaction) => {
                if (
                    !_.isEmpty(transaction) &&
                    transaction.status === "pending"
                ) {
                    if (transaction.amount == data.transactionAmount) {
                        transaction.status = "completed"
                        transaction.paymentGatewayResponse = data.response
                        await Transaction.findOneAndUpdate(
                            {
                                order_id: data.order_id
                            },
                            transaction
                        )
                        await SubscriptionModel.saveData(transaction)
                        const user = await User.findOne({
                            _id: transaction.user
                        })

                        let objToGenerateAccessToken = {
                            _id: user._id,
                            name: user.name,
                            mobile: user.mobile,
                            userType: user.userType,
                            currentPlan: user.planDetails
                        }
                        var token = jwt.sign(objToGenerateAccessToken, jwt_key)
                        const socket_url = env["SOCKET_URL"]
                        let obj = {}
                        obj.roomName = "transaction" + transaction.user
                        obj.eventName = "success-transaction"
                        obj.data = {
                            transactionId: transaction._id,
                            accessToken: token
                        }
                        axios.post(`${socket_url}/callSocket`, obj, {
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                    }
                }
            })
            .catch((err) => {
                console.log("ERROR", err)
            })
    }
    async FailureTransactionFunction(dat) {
        var data = dat
        Transaction.findOne({
            order_id: data.order_id
        }).then(async (transaction) => {
            if (!_.isEmpty(transaction) && transaction.status === "pending") {
                if (transaction.amount == data.transactionAmount) {
                    transaction.status = "cancelled"
                    transaction.paymentGatewayResponse = data.response
                    await Transaction.findOneAndUpdate(
                        {
                            order_id: data.order_id
                        },
                        transaction
                    )
                    const socket_url = env["SOCKET_URL"]
                    let obj = {}
                    obj.roomName = "transaction" + transaction.user
                    obj.eventName = "failure-transaction"
                    obj.data = {
                        transactionId: transaction._id
                    }
                    axios.post(`${socket_url}/callSocket`, obj, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                }
            }
        })
    }
}

module.exports = new Payment()

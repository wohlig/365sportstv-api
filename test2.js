import consts from "../../config/const"
import Transaction from "../../mongooseModel/Transaction"
import PaymentGatewayModel from "../../models/PaymentGatewayModel"
import httprequest from "../../common/httpService.js"
const Sha256 = require("./shah56")
class ApexpayPayment {
    callApi(httpMethod, url, body, headers) {
        console.log(body)
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
    async verifyApexpayPayment(instamojo_purpose) {
        let deferred = q.defer()
        try {
            const transaction = await Transaction.findOne({
                instamojo_purpose: instamojo_purpose,
                status: "pending",
                paymentGatewayName: "apexpay"
            })
            if (transaction && transaction._id) {
                let headers = { "Content-Type": "application/json" }
                let currencyCode = 356
                let txnType = "STATUS"
                let inputString = `AMOUNT=${
                    transaction.amount * 100
                }~CURRENCY_CODE=${currencyCode}~ORDER_ID=${instamojo_purpose}~PAY_ID=${
                    consts.apexpayPayId
                }~TXNTYPE=${txnType}`
                inputString += consts.apexpaySalt
                let hash = Sha256.hash(inputString)
                hash = hash.toUpperCase()
                let body = {
                    PAY_ID: consts.apexpayPayId,
                    ORDER_ID: instamojo_purpose,
                    AMOUNT: transaction.amount * 100,
                    TXNTYPE: txnType,
                    CURRENCY_CODE: currencyCode,
                    HASH: hash
                }
                const url = consts.apexPayStatusURL
                let apexpay = new ApexpayPayment()
                apexpay
                    .callApi("POST", url, body, headers)
                    .then((response) => {
                        console.log("status api response --> ", response)
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
    async save(response, instamojo_purpose) {
        try {
            let withoutHashResponse = _.omit(response, "HASH")
            console.log("withoutHashResponse---", withoutHashResponse)
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
            console.log("hashString---", hashString)
            let calculatedHash = Sha256.hash(hashString).toUpperCase()
            console.log("calculatedHash---", calculatedHash)
            let requestParams = {}
            let amount = response.AMOUNT ? response.AMOUNT / 100 : 0
            console.log("Reponse of apexpay amount=>", amount)
            requestParams.purpose = instamojo_purpose
            requestParams.transactionAmount = amount
            requestParams.response = response
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
                    PaymentGatewayModel.instamojoSuccessTransactionletz(
                        requestParams
                    )
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
                        response.STATUS.toLowerCase() == "denied due to fraud")
                ) {
                    PaymentGatewayModel.instamojoFailureTransaction(
                        requestParams
                    )
                }
            } else {
                requestParams.fairplayComment = "Hash Mismatch"
                PaymentGatewayModel.instamojoFailureTransaction(requestParams)
            }
        } catch (err) {
            console.log("error while fetching apexpay payments", err)
        }
    }
    verifyApexpay(instamojo_purpose) {
        try {
            let apexpay = new ApexpayPayment()
            apexpay
                .verifyApexpayPayment(instamojo_purpose)
                .then((response) => {
                    return apexpay.save(response, instamojo_purpose)
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
}
module.exports = new ApexpayPayment()

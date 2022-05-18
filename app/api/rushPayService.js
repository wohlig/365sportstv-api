import constant from "../../config/const"
import httprequest from "../../common/httpService.js"
import generateID from "../../common/getId"
import Plan from "../../mongooseModel/Plan.js"
import User from "../../mongooseModel/User.js"
import SubscriptionModel from "../../models/SubscriptionModel.js"
class RushPay {
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
    createOrder(tran) {
        let deferred = q.defer()
        try {
            let body = {
                order_id: tran.order_id,
                amount: tran.amount,
                environment:
                    constant.payGRedirectURL + "/v2/paymentstatus/rushpay",
                me_id: constant.rushMID
            }
            console.log("body", body)
            let headers = {
                "content-type": "application/json",
                APIKey: constant.rushApiKey
            }
            let url = constant.rushPaymentURL
            let RP = new RushPay()
            RP.callApi("POST", url, body, headers)
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

    createTransaction(data) {
        let deferred = q.defer()

        try {
            let GenericID = generateID.getId()
            let orderId = GenericID.substring(0, GenericID.length - 3)
            console.log("order id", orderId)
            console.log("order id length", orderId.length)
            const transactionObjToSave = {
                user: data.userId,
                plan: data.plan,
                amount: Math.floor(data.amount - data.amount * 0),
                instamojo_purpose: orderId,
                currency: ObjectId("5eb153f72a445e15b4f45894"),
                status: "pending",
                transactionType: "deposit",
                transactionWay: "Payment Gateway",
                paymentGatewayResponse: "",
                paymentGatewayName: "rushpay"
            }

            const transactionObj = new Transaction(transactionObjToSave)
            transactionObj
                .save()
                .then((dbresponse) => {
                    if (_.isEmpty(dbresponse)) {
                        deferred.reject({
                            data: "Transaction not saved"
                        })
                    }
                })
                .catch((err) => {
                    deferred.reject(err)
                })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
    async initiatePayment(req, res) {
        let data = req.body
        data.userId = req.user._id
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "Plan not found"
                }
            })
        }
        if (plan.price !== data.amount) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "Amount not matching"
                }
            })
        }
        const userData = await User.findOne({ _id: data.userId, status: "enabled", mobileVerified: true })
        if (userData == null) {
            res.status(400).send({
                status: 400,
                message: "Bad Request",
                error: {
                    message: "User not found"
                }
            })
        }
        if (userData.planDetails) {
            if (userData.planDetails.planStatus === "active") {
                res.status(400).send({
                    status: 400,
                    message: "Bad Request",
                    error: {
                        message: "User already has a plan"
                    }
                })
            }
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
            }
            userData.freeTrialUsed = true
            data.status = "completed"
            console.log("free trial", userData)
            await User.findOneAndUpdate({ _id: data.userId, status: "enabled", mobileVerified: true }, userData)
            data.user = data.userId
            data.transactionType = "free"
            let obj = new Transaction(data)
            await obj.save().then(async (data) => {
                await SubscriptionModel.saveData(data)
            })
            res.status(200).json(obj)
        } else {
            try {
                let RP = new RushPay()
                let reqData = {}
                let data = req.body
                data.userId = req.user._id
                reqData = data
                RP.createTransaction(reqData)
                    .then((transactionDetails) => {
                        reqData.order_id = transactionDetails.instamojo_purpose
                        return RP.createOrder(reqData)
                    })
                    .then((responsePage) => {
                        if (
                            responsePage &&
                            responsePage.status.toLowerCase() == "success"
                        ) {
                            return responsePage.reason
                        } else {
                            res.status(400).send({
                                status: 400,
                                message: "Bad request",
                                error: {
                                    message:
                                        "Unable to process, please try again",
                                    detials: responsePage
                                }
                            })
                        }
                    })
                    .then((url) => {
                        res.status(200).send(
                            `<head><script>window.open('${url}','_self')</script></head><body>Processing</body>`
                        )
                    })
                    .catch((error) => {
                        console.log(error)
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
    paymentStatusCron(order_id) {
        console.log("getting call by rush cron  ", order_id)
        let deferred = q.defer()
        if (order_id) {
            let tranid = order_id
            try {
                let RP = new RushPay()
                let tran = {}
                let tranSave = {
                    order_id: tranid,
                    me_id: constant.rushMID
                }
                RP.findTransactionCheck(tranid)
                    .then((goahead) => {
                        return RP.checkPaymentStatus(tranSave)
                    })
                    .then((responseData) => {
                        let modRes = responseData
                        modRes.instamojo_purpose = tranid
                        console.log(modRes)
                        return RP.updateTransactionStatus(modRes)
                    })
                    .then((updatedtranid) => {
                        console.log(updatedtranid)
                        return RP.findTransaction(updatedtranid)
                    })
                    .then((tranToUpload) => {
                        tran = tranToUpload
                        return SubscriptionModel.saveData(tran)
                    })
                    .catch((error) => {
                        deferred.reject(error)
                    })
            } catch (error) {
                deferred.reject(error)
            }
        } else {
            deferred.reject("No id found")
        }

        return deferred.promise
    }
    findTransactionCheck(instamojo_purpose) {
        let deferred = q.defer()
        try {
            Transaction.findOne({
                instamojo_purpose: instamojo_purpose,
                transactionType: "deposit"
            }).then((transactionToSave) => {
                console.log("check -->", transactionToSave)
                if (
                    transactionToSave &&
                    !_.isEmpty(transactionToSave) &&
                    transactionToSave.status != "completed"
                ) {
                    deferred.resolve(transactionToSave)
                } else {
                    deferred.reject("Tran already completed !!!")
                }
            })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
    checkPaymentStatus(details) {
        let deferred = q.defer()
        try {
            let url = constant.rushStatusURL
            let headers = {
                "content-type": "application/json",
                APIKey: constant.rushApiKey
            }
            let RP = new RushPay()
            RP.callApi("POST", url, details, headers)
                .then((response) => {
                    if (
                        (response &&
                            response.status.toLowerCase() == "successful") ||
                        response.status.toLowerCase() == "failed"
                    ) {
                        deferred.resolve(response)
                    } else {
                        deferred.reject(response)
                    }
                })
                .catch((error) => {
                    deferred.reject(error)
                })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }

    updateTransactionStatus(data) {
        let deferred = q.defer()
        try {
            if (data.status && data.txn_amount && data.txn_date) {
                let transid = data.instamojo_purpose
                let status =
                    data.status.toLowerCase() == "successful"
                        ? "completed"
                        : "cancel"
                let dataToUpdate =
                    status == "completed"
                        ? {
                              status: status,
                              amount: Math.floor(
                                  data.txn_amount - data.txn_amount * 0
                              ),
                              paymentGatewayResponse: data
                          }
                        : {
                              status: status,
                              paymentGatewayResponse: data
                          }

                Transaction.updateOne(
                    {
                        instamojo_purpose: data.instamojo_purpose,
                        transactionType: "deposit"
                    },
                    {
                        $set: dataToUpdate
                    }
                )
                deferred.resolve(transid)
            } else {
                deferred.reject("invalid data")
            }
        } catch (error) {
            console.log(error)
            deferred.reject(error)
        }
        return deferred.promise
    }
    findTransaction(instamojo_purpose) {
        let deferred = q.defer()
        try {
            Transaction.findOne({
                instamojo_purpose: instamojo_purpose,
                status: "completed",
                transactionType: "deposit"
            }).then((transactionToSave) => {
                if (transactionToSave && !_.isEmpty(transactionToSave)) {
                    deferred.resolve(transactionToSave)
                } else {
                    deferred.reject("No Transaction Found")
                }
            })
        } catch (error) {
            deferred.reject(error)
        }
        return deferred.promise
    }
}

module.exports = new RushPay()

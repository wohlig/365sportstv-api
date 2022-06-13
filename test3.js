import consts from "../../config/const"
import SubscriptionModel from "../../models/SubscriptionModel.js"
class Payment {
    paymentStatusCron(order_id) {
        console.log("getting call by rush cron  ", order_id)
        let deferred = q.defer()
        if (order_id) {
            let tranid = order_id
            try {
                let RP = new Payment()
                let tran = {}
                let tranSave = {
                    order_id: tranid,
                    me_id: consts.rushMID
                }
                PG.findTransactionCheck(tranid)
                    .then((goahead) => {
                        return PG.checkPaymentStatus(tranSave)
                    })
                    .then((responseData) => {
                        let modRes = responseData
                        modRes.instamojo_purpose = tranid
                        console.log(modRes)
                        return PG.updateTransactionStatus(modRes)
                    })
                    .then((updatedtranid) => {
                        console.log(updatedtranid)
                        return PG.findTransaction(updatedtranid)
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
            let url = consts.rushStatusURL
            let headers = {
                "content-type": "application/json",
                APIKey: consts.rushApiKey
            }
            let PG = new Payment()
            PG.callApi("POST", url, details, headers)
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

module.exports = new Payment()

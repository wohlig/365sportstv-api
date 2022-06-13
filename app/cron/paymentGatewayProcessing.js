import Transaction from "../../mongooseModel/Transaction"
const apexpay = require("../api/paymentGatewayService")
const process = async () => {
    try {
        let noOfPages = 1,
            limitNo = 50
        for (let i = 1; i <= noOfPages; i++) {
            const pendingTransactions = await Transaction.aggregate([
                {
                    $match: {
                        status: "pending",
                        paymentGatewayName: "apexpay",
                        transactionType: "deposit",
                        createdAt: {
                            $lte: new Date(moment().subtract(5, "minutes"))
                        }
                    }
                },
                { $sort: { createdAt: 1 } },
                {
                    $skip: noOfPages * limitNo - limitNo
                },
                {
                    $limit: limitNo
                }
            ])
            if (pendingTransactions && pendingTransactions.length > 0) {
                _.map(pendingTransactions, (transaction) => {
                    apexpay
                        .verifyApexpay(transaction.order_id)
                        .then((data) => {
                            console.log(data)
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
                noOfPages++
            }
        }
    } catch (error) {
        console.log("Error", error)
    }
}
module.exports = {
    process: process
}

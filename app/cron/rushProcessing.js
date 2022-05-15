import Transaction from "../../mongooseModel/Transaction"
const rushpay = require("../api/rushPayService")
const process = async () => {
    try {
        let noOfPages = 1,
            limitNo = 50
        for (let i = 1; i <= noOfPages; i++) {
            const pendingRushTransactions = await Transaction.aggregate([
                {
                    $match: {
                        status: "pending",
                        paymentGatewayName: "rushpay",
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
            if (pendingRushTransactions && pendingRushTransactions.length > 0) {
                _.map(pendingRushTransactions, (transaction) => {
                    rushpay
                        .paymentStatusCron(transaction.instamojo_purpose)
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
// const processTransactions = async () => {
//     try {
//         const RushTransactions = await Transaction.find({
//             status: "completed",
//             paymentGatewayName: "rushpay",
//             "paymentGatewayResponse.status": "Successful",
//             createdAt: {
//                 $lte: new Date(moment().subtract(20, "minutes"))
//             }
//         })
//         if (RushTransactions && RushTransactions.length > 0) {
//             _.map(RushTransactions, async (transaction) => {
//                 console.log("Verify Once --->", transaction._id)
//                 await Transaction.updateOne(
//                     {
//                         _id: ObjectId(transaction._id)
//                     },
//                     {
//                         $set: { status: "pending" }
//                     }
//                 )
//                 try {
//                     let dbOutPut = await Transaction.findOne({
//                         _id: ObjectId(transaction._id)
//                     })
//                     if (!_.isEmpty(dbOutPut)) {
//                         crmTransaction.pushCRM(dbOutPut)
//                     }
//                 } catch (error) {
//                     console.log(
//                         "Error occured while pushing cron rush payment data on crm",
//                         error
//                     )
//                 }
//             })
//         } else {
//             console.log("No Issue Found")
//         }
//     } catch (error) {
//         console.log("Error", error)
//     }
// }
module.exports = {
    process: process
    // processTransactions: processTransactions
}

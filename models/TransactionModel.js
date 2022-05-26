import { promised } from "q"
import PlanModel from "./PlanModel"
import SubscriptionModel from "./SubscriptionModel"

export default {
    //create tranasction
    // saveData: async (data, user) => {
    //     const plan = await Plan.findOne({ _id: data.plan })
    //     if (plan == null) {
    //         return { data: "Plan not found", value: false }
    //     }
    //     if (plan.price !== data.amount) {
    //         return { data: "Amount does not match", value: false }
    //     }
    //     const userData = await User.findOne({
    //         _id: user._id,
    //         status: "enabled",
    //         mobileVerified: true
    //     })
    //     if (userData == null) {
    //         return { data: "User not found", value: false }
    //     }
    //     if (userData.planDetails) {
    //         if (userData.planDetails.planStatus === "active") {
    //             return { data: "User already subscribed", value: false }
    //         }
    //     }
    //     if (plan.price == 0) {
    //         if (userData.freeTrialUsed) {
    //             return { data: "User already used free trial", value: false }
    //         }
    //         userData.freeTrialUsed = true
    //         data.status = "completed"
    //         console.log("free trial", userData)
    //         await User.findOneAndUpdate(
    //             { _id: user._id, status: "enabled", mobileVerified: true },
    //             userData
    //         )
    //         data.user = user._id
    //         data.transactionType = "free"
    //         let obj = new Transaction(data)
    //         await obj.save().then(async (data) => {
    //             if (data.paymentMode === "free") {
    //                 await SubscriptionModel.saveData(data)
    //             }
    //         })
    //         return { data: obj, value: true }
    //     } else {
    //     }
    // },
    updateData: async (id, data) => {
        let obj = await Transaction.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    getOne: async (id) => {
        let obj = await Transaction.findOne(
            {
                _id: id,
                status: "completed"
            },
            { _id: 1, plan: 1 }
        ).populate("plan", "name")
        return obj
    },
    getOneForAdmin: async (id) => {
        let obj = await Transaction.findOne({
            _id: id,
            status: "completed"
        })
            .populate("plan")
            .populate("user")
        return obj
    },
    getAllTransactionsForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["createdAt"]
        }
        if (_.isEmpty(body.sortDesc)) {
            body.sortDesc = [-1]
        } else {
            if (body.sortDesc[0] === false) {
                body.sortDesc[0] = -1
            }
            if (body.sortDesc[0] === true) {
                body.sortDesc[0] = 1
            }
        }
        var sort = {}
        sort[body.sortBy[0]] = body.sortDesc[0]
        const pageNo = body.page
        const skip = (pageNo - 1) * body.itemsPerPage
        const limit = body.itemsPerPage
        let [data, count] = await Promise.all([
            Transaction.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user"
                    }
                },
                {
                    $match: {
                        "user.name": {
                            $regex: body.searchFilter,
                            $options: "i"
                        },
                        transactionType: "deposit"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        amount: 1,
                        user: {
                            _id: 1,
                            name: 1,
                            mobile: 1
                        },
                        updatedAt: 1,
                        transactionType: 1,
                        paymentGatewayName: 1,
                        paymentGatewayResponse: 1,
                        instamojo_purpose: 1
                    }
                }
            ])
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            Transaction.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user"
                    }
                },
                {
                    $match: {
                        "user.name": {
                            $regex: body.searchFilter,
                            $options: "i"
                        },
                        transactionType: "deposit"
                    }
                }
            ])
        ])
        count = count.length
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getTotalDepositsForAdmin: async () => {
        const [data, settled] = await Promise.all([
            Transaction.aggregate([
                {
                    $match: {
                        transactionType: "deposit",
                        status: "completed"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]),
            Settledeposit.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ])
        ])
        let dataAmount, settledAmount
        if (data.length > 0) {
            dataAmount = data[0].total
        } else {
            dataAmount = 0
        }
        if (settled.length > 0) {
            settledAmount = settled[0].total
        } else {
            settledAmount = 0
        }

        return dataAmount - settledAmount
    }
}

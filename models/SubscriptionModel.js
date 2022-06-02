import Subscription from "../mongooseModel/Subscription"
import PlanModel from "./PlanModel"

export default {
    //create tranasction
    saveData: async (data) => {
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            return "Plan not found"
        }

        let subobj = {}
        const subscription = await Subscription.findOne({
            user: data.user,
            planStatus: "active"
        })
        if (subscription != null) {
            subobj.plan = plan._id
            subobj.user = data.user
            subobj.planName = plan.name
            subobj.planPrice = plan.price
            subobj.planDuration = plan.duration
            subobj.transactionId = data._id
            subobj.planStatus = "pre-active"
            subobj.startDate = moment(subscription.endDate)
                .add(1, "days")
                .startOf("day")
                .toDate()
            subobj.endDate = moment(subscription.endDate)
                .add(plan.duration, "days")
                .endOf("day")
                .toDate()
            subobj.daysRemaining = plan.duration
            let saveobj = new Subscription(subobj)
            await saveobj.save()
            return saveobj
        }
        subobj.plan = plan._id
        subobj.user = data.user
        subobj.planName = plan.name
        subobj.planPrice = plan.price
        subobj.planDuration = plan.duration
        subobj.transactionId = data._id
        subobj.planStatus = "active"
        subobj.startDate = moment().toDate()
        subobj.endDate = moment()
            .add(plan.duration - 1, "days")
            .endOf("day")
            .toDate()
        subobj.daysRemaining = plan.duration
        let userSub = {}
        userSub.planDetails = subobj
        await User.findOneAndUpdate(
            { _id: data.user, status: "enabled", mobileVerified: true },
            userSub
        )
        let saveobj = new Subscription(subobj)
        await saveobj.save()
        return saveobj
    },
    searchForUser: async (body, user) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const [data, count] = await Promise.all([
            Subscription.find({
                user: user._id
            })
                .populate("transactionId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            Subscription.countDocuments({
                user: user._id
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    updateData: async (id, data) => {
        let obj = await Subscription.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    getTotalSubscribedUsersForAdmin: async () => {
        let data = await Subscription.aggregate([
            {
                $match: {
                    planPrice: { $nin: [0] }
                }
            },
            {
                $group: {
                    _id: {
                        user: "$user"
                    }
                }
            }
        ])
        return data.length
    },
    getTotalActiveSubscribedUsersForAdmin: async () => {
        let data = await Subscription.aggregate([
            {
                $match: {
                    planPrice: { $nin: [0] },
                    planStatus: "active"
                }
            },
            {
                $group: {
                    _id: {
                        user: "$user"
                    }
                }
            }
        ])
        return data.length
    },
    getAllSubscriptionsOfOneUserForAdmin: async (body) => {
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
        const data = await Subscription.find(
            {
                user: body.userId
            },
            {
                _id: 1,
                planName: 1,
                planPrice: 1,
                startDate: 1,
                endDate: 1,
                createdAt: 1
            }
        )
            .populate("transactionId", {
                _id: 1,
                status: 1,
                transactionType: 1
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Subscription.countDocuments({
            user: body.userId
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    }
}

import Subscription from "../mongooseModel/Subscription"
import User from "../mongooseModel/User"
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
            const presubscription = await Subscription.find({
                user: data.user,
                planStatus: "pre-active"
            })
                .sort({ _id: -1 })
                .limit(1)
            if (presubscription.length > 0) {
                subobj.plan = plan._id
                subobj.user = data.user
                subobj.planName = plan.name
                subobj.planPrice = plan.price
                subobj.planDuration = plan.duration
                subobj.transactionId = data._id
                subobj.planStatus = "pre-active"
                subobj.startDate = moment(presubscription[0].endDate)
                    .add(1, "days")
                    .startOf("day")
                    .toDate()
                subobj.endDate = moment(presubscription[0].endDate)
                    .add(plan.duration - 1, "days")
                    .endOf("day")
                    .toDate()
                subobj.daysRemaining =
                    plan.duration + presubscription[0].daysRemaining
                let saveobj = new Subscription(subobj)
                await saveobj.save()
                let userSub = {}
                userSub.planDetails = subobj
                userSub.freeTrialUsed = true
                let endDate = moment(presubscription[0].endDate)
                    .add(plan.duration - 1, "days")
                    .endOf("day")
                    .toDate()
                const daysRemaining =
                    plan.duration + presubscription[0].daysRemaining
                await User.findOneAndUpdate(
                    {
                        _id: data.user,
                        status: "enabled",
                        mobileVerified: true
                    },
                    {
                        $set: {
                            "planDetails.plan": plan._id,
                            "planDetails.planName": plan.name,
                            "planDetails.planPrice": plan.price,
                            "planDetails.planDuration": plan.duration,
                            "planDetails.planDuration": data._id,
                            "planDetails.endDate": endDate,
                            "planDetails.daysRemaining": daysRemaining
                        }
                    }
                )
                return saveobj
            } else {
                subobj.plan = plan._id
                subobj.user = data.user
                subobj.planName = plan.name
                subobj.planPrice = plan.price
                subobj.planDuration = plan.duration
                subobj.transactionId = data._id
                if (subscription.planPrice == 0) {
                    subobj.planStatus = "active"
                    subobj.startDate = moment().toDate()
                    subobj.endDate = moment()
                        .add(plan.duration - 1, "days")
                        .endOf("day")
                        .toDate()
                    await Subscription.findOneAndUpdate(
                        {
                            _id: subscription._id
                        },
                        {
                            planStatus: "expired"
                        }
                    )
                    subobj.daysRemaining = plan.duration
                    let saveobj = new Subscription(subobj)
                    await saveobj.save()
                    let userSub = {}
                    userSub.planDetails = subobj
                    userSub.freeTrialUsed = true
                    await User.findOneAndUpdate(
                        {
                            _id: data.user,
                            status: "enabled",
                            mobileVerified: true
                        },
                        userSub
                    )
                    return saveobj
                } else {
                    subobj.planStatus = "pre-active"
                    subobj.startDate = moment(subscription.endDate)
                        .add(1, "days")
                        .startOf("day")
                        .toDate()
                    subobj.endDate = moment(subscription.endDate)
                        .add(plan.duration - 1, "days")
                        .endOf("day")
                        .toDate()
                    subobj.daysRemaining =
                        plan.duration + subscription.daysRemaining
                    let saveobj = new Subscription(subobj)
                    await saveobj.save()
                    let endDate = moment(subscription.endDate)
                        .add(plan.duration - 1, "days")
                        .endOf("day")
                        .toDate()
                    const daysRemaining =
                        plan.duration + subscription.daysRemaining
                    await User.findOneAndUpdate(
                        {
                            _id: data.user,
                            status: "enabled",
                            mobileVerified: true
                        },
                        {
                            $set: {
                                "planDetails.plan": plan._id,
                                "planDetails.planName": plan.name,
                                "planDetails.planPrice": plan.price,
                                "planDetails.planDuration": plan.duration,
                                "planDetails.planDuration": data._id,
                                "planDetails.endDate": endDate,
                                "planDetails.daysRemaining": daysRemaining
                            }
                        }
                    )
                    return saveobj
                }
            }
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
        userSub.freeTrialUsed = true
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
    getTotalActiveSubscribedUsersForAdmin: async () => {
        let data = await User.countDocuments({
            "planDetails.planPrice": { $nin: [0] },
            "planDetails.planStatus": "active",
            userType: "User",
            mobileVerified: true,
            status: { $in: ["enabled"] }
        })
        return data
    },
    getActiveSubscribedUsersForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["signUpDate"]
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
        const [data, count] = await Promise.all([
            User.find(
                {
                    userType: "User",
                    mobileVerified: true,
                    "planDetails.planPrice": { $nin: [0] },
                    "planDetails.planStatus": "active",
                    status: { $in: ["enabled"] },
                    name: { $regex: body.searchFilter, $options: "i" }
                },
                { name: 1, mobile: 1, _id: 1, planDetails: 1, signUpDate: 1 }
            )
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments({
                userType: "User",
                mobileVerified: true,
                "planDetails.planPrice": { $nin: [0] },
                "planDetails.planStatus": "active",
                status: { $in: ["enabled"] },
                name: { $regex: body.searchFilter, $options: "i" }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getTotalExpiredSubscribedUsersForAdmin: async () => {
        let data = await User.countDocuments({
            "planDetails.planPrice": { $nin: [0] },
            "planDetails.planStatus": "expired",
            userType: "User",
            mobileVerified: true,
            status: { $in: ["enabled"] }
        })
        return data
    },
    getExpiredSubscribedUsersForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["signUpDate"]
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
        const [data, count] = await Promise.all([
            User.find(
                {
                    userType: "User",
                    mobileVerified: true,
                    "planDetails.planPrice": { $nin: [0] },
                    "planDetails.planStatus": "expired",
                    status: { $in: ["enabled"] },
                    name: { $regex: body.searchFilter, $options: "i" }
                },
                { name: 1, mobile: 1, _id: 1, planDetails: 1, signUpDate: 1 }
            )
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments({
                userType: "User",
                mobileVerified: true,
                "planDetails.planPrice": { $nin: [0] },
                "planDetails.planStatus": "expired",
                status: { $in: ["enabled"] },
                name: { $regex: body.searchFilter, $options: "i" }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getTotalActiveFreeTrialUsersForAdmin: async () => {
        let data = await User.countDocuments({
            "planDetails.planPrice": 0,
            "planDetails.planStatus": "active",
            userType: "User",
            mobileVerified: true,
            status: { $in: ["enabled"] }
        })
        return data
    },
    getActiveFreeTrialUsersForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["signUpDate"]
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
        const [data, count] = await Promise.all([
            User.find(
                {
                    userType: "User",
                    mobileVerified: true,
                    "planDetails.planPrice": 0,
                    "planDetails.planStatus": "active",
                    status: { $in: ["enabled"] },
                    name: { $regex: body.searchFilter, $options: "i" }
                },
                { name: 1, mobile: 1, _id: 1, planDetails: 1, signUpDate: 1 }
            )
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments({
                userType: "User",
                mobileVerified: true,
                "planDetails.planPrice": 0,
                "planDetails.planStatus": "active",
                status: { $in: ["enabled"] },
                name: { $regex: body.searchFilter, $options: "i" }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getTotalExpiredFreeTrialUsersForAdmin: async () => {
        let data = await User.countDocuments({
            "planDetails.planPrice": 0,
            "planDetails.planStatus": "expired",
            userType: "User",
            mobileVerified: true,
            status: { $in: ["enabled"] }
        })
        return data
    },
    getExpiredFreeTrialUsersForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["signUpDate"]
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
        const [data, count] = await Promise.all([
            User.find(
                {
                    userType: "User",
                    mobileVerified: true,
                    "planDetails.planPrice": 0,
                    "planDetails.planStatus": "expired",
                    status: { $in: ["enabled"] },
                    name: { $regex: body.searchFilter, $options: "i" }
                },
                { name: 1, mobile: 1, _id: 1, planDetails: 1, signUpDate: 1 }
            )
                .sort(sort)
                .skip(skip)
                .limit(limit),
            User.countDocuments({
                userType: "User",
                mobileVerified: true,
                "planDetails.planPrice": 0,
                "planDetails.planStatus": "expired",
                status: { $in: ["enabled"] },
                name: { $regex: body.searchFilter, $options: "i" }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
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
        if (body.statusFilter === "clear") {
            body.statusFilter = ["active", "expired", "cancelled", "pre-active"]
        } else {
            body.statusFilter = [body.statusFilter]
        }
        var sort = {}
        sort[body.sortBy[0]] = body.sortDesc[0]
        const pageNo = body.page
        const skip = (pageNo - 1) * body.itemsPerPage
        const limit = body.itemsPerPage
        const data = await Subscription.find(
            {
                user: body.userId,
                planStatus: body.statusFilter
            },
            {
                _id: 1,
                planName: 1,
                planPrice: 1,
                planStatus: 1,
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
            user: body.userId,
            planStatus: body.statusFilter
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    }
}

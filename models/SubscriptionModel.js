import PlanModel from "./PlanModel"

export default {
    //create tranasction
    saveData: async (data) => {
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            return "Plan not found"
        }
        let subobj = {}
        subobj.plan = plan._id
        subobj.user = data.user
        subobj.planName = plan.name
        subobj.planPrice = plan.price
        subobj.planDuration = plan.duration
        subobj.transactionId = data._id
        subobj.planStatus = "active"
        subobj.startDate = new Date()
        subobj.endDate = new Date(
            new Date().setMonth(new Date().getMonth() + plan.duration)
        )
        subobj.daysRemaining = plan.duration
        let userSub = {}
        userSub.planDetails = subobj
        await User.findOneAndUpdate({ _id: data.user }, userSub)
        let saveobj = new Subscription(subobj)
        await saveobj.save()
        return saveobj
    },
    searchForUser: async (body, user) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const data = await Subscription.find({
            user: user._id
        }).populate("transactionId")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Subscription.countDocuments({
            user: user._id
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    }
}

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
        subobj.transactionId = data.transactionId
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
    }
}

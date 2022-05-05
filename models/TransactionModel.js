import PlanModel from "./PlanModel"

export default {
    //create tranasction
    saveData: async (data, user) => {
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            return "Plan not found"
        }
        if (plan.price !== data.amount) {
            return "Amount does not match"
        }
        const userData = await User.findOne({ _id: user._id })
        if (userData == null) {
            return "User not found"
        }
        if (userData.planDetails) {
            if (userData.planDetails.planStatus === "active") {
                return "User already subscribed"
            }
        }
        if (plan.price == 0) {
            if (userData.freeTrialUsed) {
                return "User already used free trial"
            }
            userData.freeTrialUsed = true
            data.status = "completed"
            await User.findOneAndUpdate({ _id: user._id }, userData)
        }
        data.user = user._id
        let obj = new Transaction(data)
        await obj.save()
        return obj
    },
    updateData: async (id, data) => {
        let obj = await Transaction.findOneAndUpdate({ _id: id }, data)
        return obj
    }
}

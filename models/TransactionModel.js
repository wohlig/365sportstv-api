import PlanModel from "./PlanModel"
import SubscriptionModel from "./SubscriptionModel"

export default {
    //create tranasction
    saveData: async (data, user) => {
        const plan = await Plan.findOne({ _id: data.plan })
        if (plan == null) {
            return { data: "Plan not found", value: false }
        }
        if (plan.price !== data.amount) {
            return { data: "Amount does not match", value: false }
        }
        const userData = await User.findOne({ _id: user._id })
        if (userData == null) {
            return { data: "User not found", value: false }
        }
        if (userData.planDetails) {
            if (userData.planDetails.planStatus === "active") {
                return { data: "User already subscribed", value: false }
            }
        }
        if (plan.price == 0) {
            if (userData.freeTrialUsed) {
                return { data: "User already used free trial", value: false }
            }
            userData.freeTrialUsed = true
            data.status = "completed"
            await User.findOneAndUpdate({ _id: user._id }, userData)
            data.user = user._id
            data.transactionType = "free"
            let obj = new Transaction(data)
            await obj.save().then(async (data) => {
                if (data.paymentMode === "free") {
                    await SubscriptionModel.saveData(data)
                }
            })
            return { data: obj, value: true }
        } else {
        }
    },
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
    }
}

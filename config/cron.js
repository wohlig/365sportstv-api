import { validateAdditionalItems } from "ajv/dist/vocabularies/applicator/additionalItems"
import { promised } from "q"
import Subscription from "../mongooseModel/Subscription"
const rush = require("../app/cron/rushProcessing")

/**
 * Add Cron Here. Refer https://www.npmjs.com/package/node-cron
 * cron.schedule('* * * * *', () => {
 * console.log('running a task every minute')
 * });
 */
if (process.env.cron) {
    cron.schedule("0 0 * * *", async () => {
        console.log("running a task every day at midnight")
        const data = await Subscription.find({
            status: "active"
        })
        if (data.length > 0) {
            _.each(data, async (item) => {
                item.daysRemaining = item.daysRemaining - 1
                if (
                    item.daysRemaining <= 0 ||
                    moment(item.endDate).utcOffset("+05:30") >=
                        moment().utcOffset("+5:30")
                ) {
                    item.planStatus = "expired"
                }
                let userSub = {}
                userSub.planDetails = item
                await promise.all([
                    SubscriptionModel.updateData(item._id, item),
                    User.findOneAndUpdate(
                        {
                            _id: item.user,
                            status: "enabled",
                            mobileVerified: true
                        },
                        userSub
                    )
                ])
            })
        }
    })
    cron.schedule("*/5 * * * *", async () => {
        console.log("rush process")
        try {
            rush.process()
        } catch (err) {}
    })
    // cron.schedule("*/20 * * * *", async () => {
    //     console.log("issue wale transaction")
    //     try {
    //         rush.processTransactions()
    //     } catch (err) {}
    // })
}

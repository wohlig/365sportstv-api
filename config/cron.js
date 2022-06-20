import { validateAdditionalItems } from "ajv/dist/vocabularies/applicator/additionalItems"
import { promised } from "q"
import Subscription from "../mongooseModel/Subscription"
const paymentGateway = require("../app/cron/paymentGatewayProcessing")

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
            planStatus: "active"
        })
        if (data.length > 0) {
            _.each(data, async (item) => {
                item.daysRemaining = item.daysRemaining - 1
                if (
                    item.daysRemaining <= 0 ||
                    moment(item.endDate).utcOffset("+05:30") <=
                        moment().utcOffset("+5:30")
                ) {
                    item.planStatus = "expired"
                }
                let userSub = {}
                userSub.planDetails = item
                await Promise.all([
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
        const preActive = await Subscription.find({
            planStatus: "pre-active"
        })
        if (preActive.length > 0) {
            _.each(preActive, async (item) => {
                if (
                    moment(item.startDate).utcOffset("+05:30") <=
                    moment().utcOffset("+5:30")
                ) {
                    item.planStatus = "active"
                    let userSub = {}
                    userSub.planDetails = item
                    await Promise.all([
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
                }
                item.daysRemaining = item.daysRemaining - 1
                await Subscription.findOneAndUpdate(item._id, item)
            })
        }
    })
    cron.schedule("*/5 * * * *", async () => {
        console.log("paymentGateway process")
        try {
            paymentGateway.process()
        } catch (err) {}
    })
    // cron.schedule("*/20 * * * *", async () => {
    //     console.log("issue wale transaction")
    //     try {
    //         rush.processTransactions()
    //     } catch (err) {}
    // })
}

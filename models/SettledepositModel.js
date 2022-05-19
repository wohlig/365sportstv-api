import moment from "moment"

export default {
    //create plan
    saveData: async (data) => {
        data.logs =
            "Rs." +
            data.amount +
            " has been settled on " +
            moment().utcOffset("+05:30").format("DD-MM-YYYY hh:mm:ss")
        let obj = new Settledeposit(data)
        await obj.save()
        return obj
    },
    search: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * body.itemsPerPage
        const limit = body.itemsPerPage
        let data = await Settledeposit.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Settledeposit.countDocuments({}).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    }
}

export default {
    //create plan
    saveData: async (data) => {
        let obj = new Plan(data)
        await obj.save()
        return obj
    },
    search: async (body) => {
        const data = await Plan.aggregate([
            {
                $match: {
                    status: { $in: ["enabled"] }
                }
            },
            {
                $lookup: {
                    from: "users",
                    pipeline: [
                        { $match: { _id: mongoose.Types.ObjectId(body.id) } }
                    ],
                    as: "users"
                }
            },
            {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { price: { $ne: 0 } },
                        { "users.freeTrialUsed": { $ne: true } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    duration: 1
                }
            }
        ])
        return data
    },
    updateData: async (id, data) => {
        let obj = await Plan.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    deleteData: async (id) => {
        let obj = await Plan.findOneAndUpdate(
            { _id: id },
            { status: "archived" }
        )
        return obj
    }
}

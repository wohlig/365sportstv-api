export default {
    saveData: async (data) => {
        let obj = new ScheduleList(data)
        await obj.save()
        return obj
    },
    deleteData: async (id) => {
        let obj = await ScheduleList.deleteOne({ _id: id })
        return obj
    },
    searchAllGamesForAdmin: async (body) => {
        let _ = require("lodash")
        if (_.isEmpty(body.sortBy)) {
            body.sortBy = ["startTime"]
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
        console.log(body.searchFilter)
        const [data, count] = await Promise.all([
            ScheduleList.aggregate([
                {
                    $match: {
                        status: { $in: ["enabled", "disabled"] },
                        name: { $regex: body.searchFilter, $options: "i" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        startTime: 1
                    }
                }
            ])
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            ScheduleList.countDocuments({
                name: { $regex: body.searchFilter, $options: "i" },
                status: { $in: ["enabled", "disabled"] }
            }).exec()
        ])
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOneGameForAdmin: async (id) => {
        const data = await ScheduleList.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    startTime: 1
                }
            }
        ]).exec()
        return data[0]
    },
    updateOneGameForAdmin: async (id, data) => {
        let obj = await ScheduleList.findOneAndUpdate({ _id: id }, data)
        return obj
    },
    deleteData: async (id) => {
        let obj = await ScheduleList.findOneAndUpdate(
            { _id: id },
            { status: "archived" }
        )
        return obj
    }
}

export default {
    //create game
    saveData: async (data) => {
        let obj = new Game(data)
        await obj.save()
        return obj
    },
    search: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const data = await Game.find({
            status: { $in: ["enabled", "disabled"] }
        })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Game.countDocuments({
            status: { $in: ["enabled", "disabled"] }
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    getOne: async (id) => {
        return await Game.findOne({
            _id: id,
            status: { $in: ["enabled", "disabled"] }
        }).exec()
    },

    updateData: async (id, data) => {
        let obj = await Game.findOneAndUpdate({ _id: id }, data, {
            new: true
        })
        return obj
    },
    deleteData: async (id) => {
        let obj = await Game.findOneAndUpdate(
            { _id: id },
            { status: "archived" },
            {
                new: true
            }
        )
        return obj
    }
}

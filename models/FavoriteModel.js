export default{
    //create or update favorites
    saveData: async (data) => {
        let obj = await Favorite.findOneAndUpdate({ userId: data.userId, gameId: data.gameId }, data, {
            new: true
        })
        return obj
    },
    search: async (body) => {
        const pageNo = body.page
        const skip = (pageNo - 1) * global.paginationLimit
        const limit = global.paginationLimit
        const data = await Favorite.find({
            userId: body.userId,
            status: { $in: ["enabled"] }
        })
            .skip(skip)
            .limit(limit)
            .exec()
        const count = await Favorite.countDocuments({
            userId: body.userId,
            status: { $in: ["enabled"] }
        }).exec()
        const maxPage = Math.ceil(count / limit)
        return { data, count, maxPage }
    },
    deleteData: async (gameId) => {
        let obj = await Favorite.findOneAndUpdate(
            { gameId: gameId },
            { status: "archived" }
        )
        return obj
    }
}